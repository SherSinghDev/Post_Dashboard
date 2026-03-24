let express = require('express')
let router = express.Router()
let SupportTicket = require('../../modals/support')
let SupportAgent = require('../../modals/supportAgent')
const users = require('../../modals/users')


router.get('/help', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }

    try {
        let already = 0;
        let user = await users.findOne({ _id: req.session.userId })

        const ticket = await SupportTicket.findOne({
            userId: user.userId,
            status: { $in: ['OPEN', 'CALLING', 'IN_PROGRESS'] }
        });

        if (ticket) {
            already = 1;
        }

        // console.log('Already raised ticket:', already);

        res.render('support/support', {
            page: 'Support',
            already
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



router.post('/support/create', async (req, res) => {
    let user = await users.findOne({ _id: req.session.userId })
    const ticket = await SupportTicket.create({
        ticketId: `TKT-${Date.now()}`,
        userId: user.userId,
        username: user.name,
        mobile: user.mobile,
        userRole: user.role,
        category: req.body.category,
        priority: req.body.priority,
        parcelId: req.body.parcelId,
        issueSummary: req.body.issueSummary
    });

    res.json({ success: true, ticket });
});



router.get('/support/queue', async (req, res) => {
    const tickets = await SupportTicket.find({
        status: 'OPEN'
    }).sort({
        priority: -1,
        createdAt: 1
    });

    res.json(tickets);
});


// router.post('/support/assign-next/:agentId', async (req, res) => {
//     const agent = await SupportAgent.findById(req.params.agentId);

//     if (agent.status !== 'AVAILABLE') {
//         return res.json({ message: 'Agent is busy' });
//     }

//     const ticket = await SupportTicket.findOne({
//         status: 'OPEN'
//     }).sort({
//         priority: -1,
//         createdAt: 1
//     });

//     if (!ticket) {
//         return res.json({ message: 'No tickets available' });
//     }

//     ticket.status = 'CALLING';
//     ticket.assignedTo = agent._id;
//     await ticket.save();

//     agent.status = 'BUSY';
//     agent.activeTicket = ticket._id;
//     await agent.save();

//     res.json(ticket);
// });


router.post('/support/log-call/:ticketId', async (req, res) => {
    const { outcome, duration } = req.body;

    const ticket = await SupportTicket.findById(req.params.ticketId);

    ticket.callLogs.push({
        calledAt: new Date(),
        duration,
        outcome
    });

    if (outcome === 'CONNECTED') {
        ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();
    res.json({ success: true });
});


router.post('/support/resolve/:ticketId', async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.ticketId);

    ticket.status = 'RESOLVED';
    ticket.resolutionNote = req.body.resolutionNote;
    ticket.resolvedAt = new Date();
    await ticket.save();

    const agent = await SupportAgent.findById(ticket.assignedTo);
    agent.status = 'AVAILABLE';
    agent.activeTicket = null;
    await agent.save();
    res.json({ success: true });
});


router.post('/support/requeue/:ticketId', async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.ticketId);

    ticket.status = 'OPEN';
    ticket.assignedTo = null;
    await ticket.save();

    res.json({ success: true });
});



/* =====================================================
   GET /agent/dashboard
===================================================== */
router.get('/dashboard', async (req, res) => {
    try {
        if (!req.session.agentId) {
            return res.redirect('/auth/login');
        }

        const agentId = req.session.agentId;

        const agent = await SupportAgent.findById(agentId);

        if (!agent) {
            return res.redirect('/auth/login');
        }

        // Fetch tickets assigned to this agent
        // const tickets = await SupportTicket.find({
        //     assignedTo: agentId
        // })

        const tickets = await SupportTicket.find()
            .sort({ createdAt: -1 }) // latest first
            .lean();

        // Find active ticket (not resolved/closed)
        const activeTicket = tickets.find(t => (['OPEN', 'CALLING', 'IN_PROGRESS'].includes(t.status) && t.assignedTo == agentId)
        );

        res.render('support/agent-dashboard', {
            page: 'Agent Dashboard',
            agent,
            tickets,
            activeTicket
        });

    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');

    }
});



// router.get('/dashboard', async (req, res) => {
//     if (req.session.agentId) {
//         try {
//             const agentId = req.session.agentId; // set at login

//             if (!agentId) {
//                 return res.redirect('/agent/login');
//             }

//             const agent = await SupportAgent.findById(agentId);

//             res.render('support/agent-dashboard', {
//                 page: 'Agent Dashboard',
//                 agent,
//                 activeTicket: agent.activeTicket || null
//             });

//         } catch (err) {
//             console.error(err);
//             res.status(500).send('Server Error');
//         }
//     }
//     else {
//         res.redirect('/auth/login')
//     }

// });



/* =====================================================
   POST /support/assign-next/:agentId
   ===================================================== */
router.post('/support/assign-next/:agentId', async (req, res) => {
    try {
        const agent = await SupportAgent.findById(req.params.agentId);

        if (!agent || agent.status !== 'AVAILABLE') {
            return res.redirect('/support/dashboard');
        }

        const ticket = await SupportTicket.findOne({
            status: 'OPEN'
        }).sort({
            priority: -1,
            createdAt: 1
        });

        if (!ticket) {
            return res.redirect('/support/dashboard');
        }

        // Assign ticket
        ticket.status = 'CALLING';
        ticket.assignedTo = agent._id;
        await ticket.save();

        // Update agent
        agent.status = 'BUSY';
        agent.activeTicket = ticket._id;
        await agent.save();

        res.redirect(`/support/ticket/${ticket._id}`);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



/* =====================================================
   GET /agent/ticket/:ticketId
   ===================================================== */
router.get('/ticket/:ticketId', async (req, res) => {
    if (req.session.agentId) {
        try {
            const ticket = await SupportTicket.findById(req.params.ticketId);
            // let userId = ticket.userId
            // let user = await users.findOne({ _id: userId }).select('name email mobile')

            if (!ticket) {
                return res.redirect('/support/dashboard');
            }

            res.render('support/agent-ticket', {
                page: 'Handle Ticket',
                ticket,
                user: { name: ticket.username, mobile: ticket.mobile }
            });

        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }
    else {
        res.redirect('/auth/login')
    }

});


module.exports = router
