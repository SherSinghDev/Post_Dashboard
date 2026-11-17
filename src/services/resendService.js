/**
 * Resend Email Service for BSRF (BINUPUR SEVA RESEARCH FOUNDATION)
 * Sends position-specific salary guide and job responsibilities to verified Single Order users.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'BINUPUR SEVA RESEARCH FOUNDATION <onboarding@resend.dev>';

/**
 * Returns plain text and HTML templates for Field Officer
 */
function getFieldOfficerContent(candidateName) {
  const subject = 'Appointment & Salary Structure - Field Officer | BINUPUR SEVA RESEARCH FOUNDATION';
  const text = `Dear ${candidateName},

Greetings from BINUPUR SEVA RESEARCH FOUNDATION (BSRF).

We are pleased to share the salary structure, performance targets and job responsibilities for the position of Field Officer.

1. Employment & Salary Details

- Position: Field Officer
- Monthly Fixed Salary: ₹15,000
- Daily Survey Target: 25 Patients
- Monthly Survey Target: 750 Patients
- Reporting Authority: Block Officer

2. Daily & Monthly Work Targets

1. Conduct a free health survey of at least 25 patients every working day.
2. Complete a monthly target of 750 patients through free health surveys.
3. Identify eligible beneficiaries for the BSRF Free Health Project.
4. Explain the benefits and process of the Free Health Project to patients.
5. Complete patient registration and collect all required information.
6. Maintain proper patient records and submit daily survey reports.

Important Patient Eligibility Criteria:

A patient will be considered a successfully completed survey only when:
- The patient's health survey has been completed.
- The patient has successfully registered under the BSRF Free Health Project.
- The patient has opted to receive the free Ayurvedic medicines offered under the project.

Simply collecting patient details or completing a survey form will not be counted towards the monthly target unless the patient meets the above eligibility criteria.

3. Key Roles & Responsibilities

1. Conduct field surveys and community outreach activities.
2. Identify and register eligible beneficiaries under BSRF projects.
3. Promote the Free Health Project and other NGO initiatives.
4. Collect and verify beneficiary information and documents.
5. Generate awareness about NGO programs in assigned areas.
6. Submit daily work reports to the Block Officer.
7. Maintain accurate records of patient registrations and medicine distribution requests.
8. Coordinate with local communities to achieve assigned targets.

4. Salary & Performance Evaluation

- Monthly Fixed Salary: ₹15,000.
- Daily Target: 25 eligible patients.
- Monthly Target: 750 eligible patients.
- Monthly performance will be evaluated based on verified patient registrations and eligibility for free Ayurvedic medicines.
- Attendance, discipline, reporting and work quality will also be considered during performance evaluation.

5. Reporting & Accountability

The Field Officer will report directly to the Block Officer and must submit daily performance reports.

We expect dedication, honesty, discipline and commitment towards the organization's mission of providing accessible healthcare services to society.

We wish you success in your role and look forward to your contribution.

Best Regards,

HR Department
BINUPUR SEVA RESEARCH FOUNDATION (BSRF)`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0d6efd; color: #ffffff; padding: 25px; text-align: center;">
      <h2 style="margin: 0; font-size: 24px;">BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Free Health Project & Social Welfare Initiatives</p>
    </div>
    
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Dear <strong>${candidateName}</strong>,</p>
      <p>Greetings from <strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong>.</p>
      <p>We are pleased to confirm your verification and share the salary structure, performance targets and job responsibilities for the position of <strong>Field Officer</strong>.</p>
      
      <!-- Key Highlights Box -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 18px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #0d6efd; font-size: 18px;">1. Employment & Salary Details</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Position:</strong> Field Officer</li>
          <li><strong>Monthly Fixed Salary:</strong> <span style="color: #198754; font-weight: bold; font-size: 17px;">₹15,000</span></li>
          <li><strong>Daily Survey Target:</strong> 25 Patients</li>
          <li><strong>Monthly Survey Target:</strong> 750 Patients</li>
          <li><strong>Reporting Authority:</strong> Block Officer</li>
        </ul>
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">2. Daily & Monthly Work Targets</h3>
      <ol style="padding-left: 20px;">
        <li>Conduct a free health survey of at least <strong>25 patients</strong> every working day.</li>
        <li>Complete a monthly target of <strong>750 patients</strong> through free health surveys.</li>
        <li>Identify eligible beneficiaries for the BSRF Free Health Project.</li>
        <li>Explain the benefits and process of the Free Health Project to patients.</li>
        <li>Complete patient registration and collect all required information.</li>
        <li>Maintain proper patient records and submit daily survey reports.</li>
      </ol>

      <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 14px; border-radius: 4px; margin: 15px 0;">
        <strong>Important Patient Eligibility Criteria:</strong><br>
        A patient will be considered a successfully completed survey only when:
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>The patient's health survey has been completed.</li>
          <li>The patient has successfully registered under the BSRF Free Health Project.</li>
          <li>The patient has opted to receive the free Ayurvedic medicines offered under the project.</li>
        </ul>
        <small><em>*Simply collecting details without registration & medicine opt-in will not count towards targets.</em></small>
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">3. Key Roles & Responsibilities</h3>
      <ol style="padding-left: 20px;">
        <li>Conduct field surveys and community outreach activities.</li>
        <li>Identify and register eligible beneficiaries under BSRF projects.</li>
        <li>Promote the Free Health Project and other NGO initiatives.</li>
        <li>Collect and verify beneficiary information and documents.</li>
        <li>Generate awareness about NGO programs in assigned areas.</li>
        <li>Submit daily work reports to the Block Officer.</li>
        <li>Maintain accurate records of patient registrations and medicine distribution requests.</li>
        <li>Coordinate with local communities to achieve assigned targets.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">4. Salary & Performance Evaluation</h3>
      <ul style="padding-left: 20px;">
        <li><strong>Monthly Fixed Salary:</strong> ₹15,000.</li>
        <li><strong>Daily Target:</strong> 25 eligible patients.</li>
        <li><strong>Monthly Target:</strong> 750 eligible patients.</li>
        <li>Monthly performance will be evaluated based on verified patient registrations and eligibility for free Ayurvedic medicines.</li>
        <li>Attendance, discipline, reporting and work quality will also be considered during performance evaluation.</li>
      </ul>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">5. Reporting & Accountability</h3>
      <p>The Field Officer will report directly to the <strong>Block Officer</strong> and must submit daily performance reports.</p>
      <p>We expect dedication, honesty, discipline and commitment towards the organization's mission of providing accessible healthcare services to society.</p>
      
      <p style="margin-top: 25px;">We wish you success in your role and look forward to your contribution.</p>
      
      <div style="margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 15px;">
        <p style="margin: 0;"><strong>Best Regards,</strong></p>
        <p style="margin: 3px 0 0 0; color: #495057;">HR Department<br><strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong></p>
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

/**
 * Returns plain text and HTML templates for Block Officer
 */
function getBlockOfficerContent(candidateName) {
  const subject = 'Appointment & Salary Structure - Block Officer | BINUPUR SEVA RESEARCH FOUNDATION';
  const text = `Dear ${candidateName},

Greetings from BINUPUR SEVA RESEARCH FOUNDATION (BSRF).

We are pleased to share the salary structure, team management responsibilities and monthly performance targets for the position of Block Officer.

1. Employment & Salary Details

- Position: Block Officer
- Monthly Salary: ₹20,000
- Assigned Area: One Block
- Team Requirement: 10 Field Officers
- Reporting Authority: District Officer

2. Team Formation & Management

1. Recruit and appoint 10 Field Officers within the assigned block.
2. Ensure that all 10 Field Officers are actively working.
3. Train and guide the Field Officers regarding the BSRF Free Health Project.
4. Assign villages and areas to each Field Officer.
5. Monitor daily attendance, field activities and performance.
6. Ensure proper coordination and discipline among all team members.

3. Monthly Performance Targets

Each Field Officer must achieve the following targets:
- Daily Target: 25 Eligible Patients
- Monthly Target: 750 Eligible Patients

Block-Level Monthly Target:
- Total Field Officers: 10
- Monthly Target per Field Officer: 750 Patients
- Total Monthly Block Target: 7,500 Eligible Patients

Important Patient Eligibility Criteria:
A patient will be counted towards the target only when the patient:
1. Has completed the health survey.
2. Has successfully registered under the BSRF Free Health Project.
3. Has opted to receive free Ayurvedic medicines offered under the project.

Only verified and eligible patient registrations will be counted towards the monthly performance target.

4. Salary & Performance Conditions

- Monthly Salary: ₹20,000.
- The salary is linked to the successful achievement of the assigned block-level targets.
- The Block Officer must ensure that all 10 Field Officers achieve their individual monthly targets.
- Monthly performance will be evaluated based on verified patient registrations.
- Team management, attendance, reporting, discipline and operational performance will also be considered.
- Salary processing will be subject to monthly performance verification and approval by the District Officer / Head Office.

5. Key Roles & Responsibilities

1. Manage and supervise all NGO activities within the assigned block.
2. Recruit, train and manage 10 Field Officers.
3. Ensure completion of 7,500 eligible patient registrations every month.
4. Monitor daily field surveys and patient registrations.
5. Verify the performance reports submitted by Field Officers.
6. Coordinate with village-level representatives and local communities.
7. Resolve operational issues and maintain team discipline.
8. Submit daily, weekly and monthly performance reports to the District Officer.
9. Ensure proper implementation of the Free Health Project.
10. Maintain transparency and accuracy in all project activities.

6. Reporting & Accountability

The Block Officer will report directly to the District Officer and will be responsible for the overall performance, team management and achievement of monthly targets within the assigned block.

We expect strong leadership, team-building capabilities, accountability and dedication towards the organization's mission.

Best Regards,

HR Department
BINUPUR SEVA RESEARCH FOUNDATION (BSRF)`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0d6efd; color: #ffffff; padding: 25px; text-align: center;">
      <h2 style="margin: 0; font-size: 24px;">BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Free Health Project & Social Welfare Initiatives</p>
    </div>
    
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Dear <strong>${candidateName}</strong>,</p>
      <p>Greetings from <strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong>.</p>
      <p>We are pleased to confirm your verification and share the salary structure, team management responsibilities and monthly performance targets for the position of <strong>Block Officer</strong>.</p>
      
      <!-- Key Highlights Box -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 18px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #0d6efd; font-size: 18px;">1. Employment & Salary Details</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Position:</strong> Block Officer</li>
          <li><strong>Monthly Salary:</strong> <span style="color: #198754; font-weight: bold; font-size: 17px;">₹20,000</span></li>
          <li><strong>Assigned Area:</strong> One Block</li>
          <li><strong>Team Requirement:</strong> 10 Field Officers</li>
          <li><strong>Reporting Authority:</strong> District Officer</li>
        </ul>
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">2. Team Formation & Management</h3>
      <ol style="padding-left: 20px;">
        <li>Recruit and appoint <strong>10 Field Officers</strong> within the assigned block.</li>
        <li>Ensure that all 10 Field Officers are actively working.</li>
        <li>Train and guide the Field Officers regarding the BSRF Free Health Project.</li>
        <li>Assign villages and areas to each Field Officer.</li>
        <li>Monitor daily attendance, field activities and performance.</li>
        <li>Ensure proper coordination and discipline among all team members.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">3. Monthly Performance Targets</h3>
      <p><strong>Field Officer Target:</strong> Daily: 25 Patients | Monthly: 750 Patients</p>
      <div style="background-color: #e7f1ff; border: 1px solid #b6d4fe; color: #084298; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
        <strong>Block-Level Monthly Target:</strong> 10 Field Officers × 750 Patients = <strong>7,500 Eligible Patients</strong>
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 14px; border-radius: 4px; margin: 15px 0;">
        <strong>Important Patient Eligibility Criteria:</strong><br>
        A patient will be counted towards the target only when the patient:
        <ol style="margin: 5px 0 0 0; padding-left: 20px;">
          <li>Has completed the health survey.</li>
          <li>Has successfully registered under the BSRF Free Health Project.</li>
          <li>Has opted to receive free Ayurvedic medicines offered under the project.</li>
        </ol>
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">4. Salary & Performance Conditions</h3>
      <ul style="padding-left: 20px;">
        <li>Monthly Salary: <strong>₹20,000</strong> linked to block-level target achievement.</li>
        <li>Ensure all 10 Field Officers achieve their individual monthly targets.</li>
        <li>Monthly performance evaluated on verified patient registrations.</li>
        <li>Team management, reporting, attendance and operational discipline are essential.</li>
      </ul>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">5. Key Roles & Responsibilities</h3>
      <ol style="padding-left: 20px;">
        <li>Manage and supervise all NGO activities within the assigned block.</li>
        <li>Recruit, train and manage 10 Field Officers.</li>
        <li>Ensure completion of 7,500 eligible patient registrations every month.</li>
        <li>Monitor daily field surveys and patient registrations.</li>
        <li>Verify the performance reports submitted by Field Officers.</li>
        <li>Coordinate with village-level representatives and local communities.</li>
        <li>Resolve operational issues and maintain team discipline.</li>
        <li>Submit daily, weekly and monthly performance reports to the District Officer.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">6. Reporting & Accountability</h3>
      <p>The Block Officer will report directly to the <strong>District Officer</strong> and will be responsible for overall performance and target achievement in the assigned block.</p>
      
      <p style="margin-top: 25px;">We expect strong leadership, team-building capabilities, accountability and dedication towards the organization's mission.</p>
      
      <div style="margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 15px;">
        <p style="margin: 0;"><strong>Best Regards,</strong></p>
        <p style="margin: 3px 0 0 0; color: #495057;">HR Department<br><strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong></p>
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

/**
 * Returns plain text and HTML templates for District Officer
 */
function getDistrictOfficerContent(candidateName) {
  const subject = 'Appointment & Salary Structure - District Officer | BINUPUR SEVA RESEARCH FOUNDATION';
  const text = `Dear ${candidateName},

Greetings from BINUPUR SEVA RESEARCH FOUNDATION (BSRF).

We are pleased to share the salary structure, district-level management responsibilities and monthly performance targets for the position of District Officer.

1. Employment & Salary Details

- Position: District Officer
- Monthly Salary: ₹30,000
- Assigned Area: One District
- Reporting Authority: Head Office / Senior Management
- Department: District Administration & Operations

2. District-Level Team Formation

The District Officer will be responsible for establishing and managing the complete organizational structure across the assigned district.
Key responsibilities include:
1. Appoint City Officers and Block Officers in their respective areas.
2. Ensure that every assigned block and city has an active officer.
3. Ensure that each Block Officer recruits and manages a team of 10 Field Officers.
4. Develop a strong district-level management and field operations team.
5. Train and guide all City Officers, Block Officers and Field Officers.
6. Assign operational responsibilities and geographical areas to each team.
7. Monitor recruitment, attendance and team performance.
8. Ensure proper coordination between all district-level teams.

3. Monthly Patient Survey Targets

Field Officer Target: Daily: 25 Patients | Monthly: 750 Patients
Block-Level Target: 10 Field Officers per Block = 7,500 Patients per Block
District-Level Target:
- 5 Blocks × 7,500 Patients = 37,500 Patients per Month
- 10 Blocks × 7,500 Patients = 75,000 Patients per Month

4. Important Patient Eligibility Criteria

A patient will be counted towards the monthly target only when:
1. The patient's health survey has been successfully completed.
2. The patient has registered under the BSRF Free Health Project.
3. The patient has voluntarily opted to receive free Ayurvedic medicines offered under the project.

5. Salary & Performance Conditions

- Monthly Salary: ₹30,000.
- Salary will be linked to district-level performance and achievement of assigned monthly targets.
- Performance will be evaluated based on verified patient registrations, team strength, recruitment, attendance and operational management.
- Monthly performance reports must be submitted to the Head Office.

6. Key Roles & Responsibilities

1. Lead and manage all NGO operations across the assigned district.
2. Appoint and supervise City Officers and Block Officers.
3. Ensure recruitment of 10 Field Officers under each Block Officer.
4. Monitor block-wise and city-wise patient survey targets.
5. Ensure successful implementation of the BSRF Free Health Project.
6. Conduct regular review meetings with all City Officers and Block Officers.
7. Monitor daily, weekly and monthly performance reports.
8. Coordinate with government departments, institutions and local representatives.
9. Resolve operational and administrative issues.
10. Maintain transparency, accountability and discipline across the district team.
11. Expand BSRF's organizational network and community welfare activities.
12. Ensure achievement of all targets assigned by the Head Office.

7. Reporting & Accountability

The District Officer will report directly to the Head Office / Senior Management.

We expect excellent leadership, administrative capabilities, team-building skills and a strong commitment to the organization's vision and mission.

Best Regards,

HR & Administration Department
BINUPUR SEVA RESEARCH FOUNDATION (BSRF)`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0d6efd; color: #ffffff; padding: 25px; text-align: center;">
      <h2 style="margin: 0; font-size: 24px;">BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Free Health Project & Social Welfare Initiatives</p>
    </div>
    
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Dear <strong>${candidateName}</strong>,</p>
      <p>Greetings from <strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong>.</p>
      <p>We are pleased to confirm your verification and share the salary structure, district-level management responsibilities and monthly performance targets for the position of <strong>District Officer</strong>.</p>
      
      <!-- Key Highlights Box -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 18px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #0d6efd; font-size: 18px;">1. Employment & Salary Details</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Position:</strong> District Officer</li>
          <li><strong>Monthly Salary:</strong> <span style="color: #198754; font-weight: bold; font-size: 17px;">₹30,000</span></li>
          <li><strong>Assigned Area:</strong> One District</li>
          <li><strong>Department:</strong> District Administration & Operations</li>
          <li><strong>Reporting Authority:</strong> Head Office / Senior Management</li>
        </ul>
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">2. District-Level Team Formation</h3>
      <ol style="padding-left: 20px;">
        <li>Appoint City Officers and Block Officers in their respective areas.</li>
        <li>Ensure every assigned block and city has an active officer.</li>
        <li>Ensure each Block Officer recruits and manages 10 Field Officers.</li>
        <li>Develop a strong district management and field operations team.</li>
        <li>Train and guide all City Officers, Block Officers and Field Officers.</li>
        <li>Monitor recruitment, attendance and performance across the district.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">3. Monthly Patient Survey Targets</h3>
      <div style="background-color: #e7f1ff; border: 1px solid #b6d4fe; color: #084298; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
        <strong>Target Structure:</strong><br>
        • Field Officer: 25/day | 750/month<br>
        • Block (10 Field Officers): 7,500/month<br>
        • District Example: 5 Blocks = 37,500/month | 10 Blocks = 75,000/month
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 14px; border-radius: 4px; margin: 15px 0;">
        <strong>Important Patient Eligibility Criteria:</strong><br>
        Patient must have completed health survey, registered under BSRF Free Health Project, and opted for free Ayurvedic medicines.
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">4. Salary & Performance Conditions</h3>
      <ul style="padding-left: 20px;">
        <li>Monthly Salary: <strong>₹30,000</strong> linked to district performance and target completion.</li>
        <li>Performance evaluated on verified patient registrations, team strength, and operational discipline.</li>
        <li>Monthly reports to be submitted directly to Head Office.</li>
      </ul>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">5. Key Roles & Responsibilities</h3>
      <ol style="padding-left: 20px;">
        <li>Lead and manage all NGO operations across the assigned district.</li>
        <li>Appoint and supervise City Officers and Block Officers.</li>
        <li>Ensure recruitment of 10 Field Officers under each Block Officer.</li>
        <li>Monitor block-wise and city-wise patient survey targets.</li>
        <li>Conduct regular review meetings with all officers.</li>
        <li>Coordinate with local government departments, institutions and community leaders.</li>
        <li>Maintain transparency, accountability and discipline across the district team.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">6. Reporting & Accountability</h3>
      <p>The District Officer will report directly to the <strong>Head Office / Senior Management</strong>.</p>
      
      <p style="margin-top: 25px;">We expect excellent leadership, administrative capabilities, team-building skills and a strong commitment to the organization's vision.</p>
      
      <div style="margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 15px;">
        <p style="margin: 0;"><strong>Best Regards,</strong></p>
        <p style="margin: 3px 0 0 0; color: #495057;">HR & Administration Department<br><strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong></p>
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

/**
 * Returns plain text and HTML templates for State Head / State Officer
 */
function getStateOfficerContent(candidateName) {
  const subject = 'Appointment & Salary Structure - State Officer | BINUPUR SEVA RESEARCH FOUNDATION';
  const text = `Dear ${candidateName},

Greetings from BINUPUR SEVA RESEARCH FOUNDATION (BSRF).

We are pleased to share the salary structure, state-level management responsibilities and performance targets for the position of STATE OFFICER.

1. Employment & Salary Details

- Position: State Officer
- Monthly Salary: ₹1,00,000 (One Lakh Rupees)
- Assigned Area: One State
- Department: State Administration & Operations
- Reporting Authority: Head Office / Senior Management

2. State-Level Team Formation & Management

The State Officer will be responsible for establishing, expanding and managing BSRF's organizational network throughout the assigned state.
Key responsibilities include:
1. Identify, recruit and appoint District Officers in every assigned district.
2. Ensure that every district has an active and responsible District Officer.
3. Guide District Officers in appointing City Officers and Block Officers.
4. Ensure that every Block Officer recruits and manages a team of 10 Field Officers.
5. Develop a strong organizational structure throughout the state.
6. Train and guide District Officers regarding BSRF projects and operational policies.
7. Monitor district-wise recruitment, team development and performance.
8. Ensure proper coordination between all District Officers and the Head Office.

3. State-Level Monthly Patient Survey Targets

The State Officer will be directly responsible for achieving the overall state-level monthly patient survey target through the District Officers and their respective teams.

Field Officer Target: Daily: 25 Patients | Monthly: 750 Patients
Block-Level Target: 10 Field Officers per Block = 7,500 Patients per Block
District-Level Target: Assigned based on active blocks and cities.

State-Level Target Example:
For 75 districts, 5 blocks per district = 375 blocks, 3,750 Field Officers:
Total State-Level Monthly Target: 28,12,500 Eligible Patients.

4. Important Patient Eligibility Criteria

A patient will be counted towards the monthly target only when:
1. The patient's health survey has been successfully completed.
2. The patient has registered under the BSRF Free Health Project.
3. The patient has voluntarily opted to receive free Ayurvedic medicines offered under the project.

5. Salary & Performance Evaluation

Monthly Salary: ₹1,00,000

The State Officer's salary and performance will be evaluated based on:
1. Appointment of District Officers across the assigned state.
2. Establishment of active district-level management teams.
3. Recruitment and development of City Officers and Block Officers.
4. Formation of Field Officer teams across assigned blocks.
5. Achievement of state-level monthly patient survey targets.
6. Verification of genuine patient registrations.
7. Regular monitoring of district-wise performance.
8. Timely submission of weekly and monthly reports.

6. Key Roles & Responsibilities

1. Lead and manage all BSRF operations throughout the assigned state.
2. Recruit and appoint District Officers in all assigned districts.
3. Ensure that every district has a functional management team.
4. Monitor the performance and target achievement of District Officers.
5. Ensure appointment of City Officers and Block Officers.
6. Monitor block-wise, district-wise and state-wise patient survey targets.
7. Ensure successful implementation of the BSRF Free Health Project.
8. Conduct regular online and offline review meetings.
9. Coordinate with government departments, institutions and local representatives.
10. Resolve operational and administrative challenges.
11. Maintain transparency, accountability and discipline across all teams.
12. Expand BSRF's organizational network and social welfare activities.
13. Submit consolidated weekly and monthly performance reports to the Head Office.

7. Reporting & Accountability

The State Officer will report directly to the Head Office / Senior Management.

8. Organizational Vision

The primary objective of this position is to establish a strong BSRF organizational network throughout the assigned state and ensure the successful implementation of healthcare and social welfare initiatives.

We expect exceptional leadership, strategic planning, administrative capabilities and a strong commitment towards the organization's vision and mission.

Best Regards,

HR & Administration Department
BINUPUR SEVA RESEARCH FOUNDATION (BSRF)`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 680px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0d6efd; color: #ffffff; padding: 25px; text-align: center;">
      <h2 style="margin: 0; font-size: 24px;">BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Free Health Project & Social Welfare Initiatives</p>
    </div>
    
    <div style="padding: 30px;">
      <p style="font-size: 16px;">Dear <strong>${candidateName}</strong>,</p>
      <p>Greetings from <strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong>.</p>
      <p>We are pleased to confirm your verification and share the salary structure, state-level management responsibilities and performance targets for the position of <strong>State Officer / State Head</strong>.</p>
      
      <!-- Key Highlights Box -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #0d6efd; padding: 18px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #0d6efd; font-size: 18px;">1. Employment & Salary Details</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Position:</strong> State Officer / State Head</li>
          <li><strong>Monthly Salary:</strong> <span style="color: #198754; font-weight: bold; font-size: 18px;">₹1,00,000 (One Lakh Rupees)</span></li>
          <li><strong>Assigned Area:</strong> One State</li>
          <li><strong>Department:</strong> State Administration & Operations</li>
          <li><strong>Reporting Authority:</strong> Head Office / Senior Management</li>
        </ul>
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">2. State-Level Team Formation & Management</h3>
      <ol style="padding-left: 20px;">
        <li>Identify, recruit and appoint District Officers in every assigned district.</li>
        <li>Ensure every district has an active and responsible District Officer.</li>
        <li>Guide District Officers in appointing City Officers and Block Officers.</li>
        <li>Ensure every Block Officer recruits and manages a team of 10 Field Officers.</li>
        <li>Develop a strong organizational structure throughout the state.</li>
        <li>Train and guide District Officers regarding BSRF projects and policies.</li>
        <li>Ensure proper coordination between all District Officers and the Head Office.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">3. State-Level Monthly Patient Survey Targets</h3>
      <p>Directly responsible for state-wide target achievement across all active districts and blocks.</p>
      <div style="background-color: #e7f1ff; border: 1px solid #b6d4fe; color: #084298; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
        <strong>Target Benchmark:</strong> Field Officer (750/mo) | Block (7,500/mo) | State Targets scaled by active districts and blocks.
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 14px; border-radius: 4px; margin: 15px 0;">
        <strong>Important Patient Eligibility Criteria:</strong><br>
        Only genuine and verified patient registrations who opted for free Ayurvedic medicines count towards targets.
      </div>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">4. Salary & Performance Evaluation</h3>
      <ul style="padding-left: 20px;">
        <li>Monthly Salary: <strong>₹1,00,000</strong>.</li>
        <li>Evaluated on appointment of District Officers, active district teams, recruitment, and state-wide target achievement.</li>
        <li>Weekly and monthly reports to be submitted to Head Office.</li>
      </ul>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">5. Key Roles & Responsibilities</h3>
      <ol style="padding-left: 20px;">
        <li>Lead and manage all BSRF operations throughout the assigned state.</li>
        <li>Recruit and appoint District Officers in all assigned districts.</li>
        <li>Monitor block-wise, district-wise and state-wise targets.</li>
        <li>Ensure successful implementation of BSRF healthcare and welfare initiatives.</li>
        <li>Conduct regular online and offline review meetings.</li>
        <li>Coordinate with government departments, institutions and local leadership.</li>
        <li>Maintain transparency, accountability and discipline across all state teams.</li>
      </ol>

      <h3 style="color: #212529; border-bottom: 2px solid #e9ecef; padding-bottom: 8px;">6. Reporting & Accountability</h3>
      <p>The State Officer reports directly to the <strong>Head Office / Senior Management</strong>.</p>
      
      <p style="margin-top: 25px;">We expect exceptional leadership, strategic planning, administrative capabilities and a strong commitment towards the organization's vision.</p>
      
      <div style="margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 15px;">
        <p style="margin: 0;"><strong>Best Regards,</strong></p>
        <p style="margin: 3px 0 0 0; color: #495057;">HR & Administration Department<br><strong>BINUPUR SEVA RESEARCH FOUNDATION (BSRF)</strong></p>
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

/**
 * Maps position to corresponding content
 */
function getGuideContent(position, candidateName = 'Candidate') {
  const pos = (position || '').toLowerCase().trim();
  if (pos.includes('state')) {
    return getStateOfficerContent(candidateName);
  } else if (pos.includes('district')) {
    return getDistrictOfficerContent(candidateName);
  } else if (pos.includes('block')) {
    return getBlockOfficerContent(candidateName);
  } else {
    // Default to Field Officer (covers 'field officer', 'field', etc.)
    return getFieldOfficerContent(candidateName);
  }
}

/**
 * Sends the Salary Guide email to a verified Single Order candidate using Resend API
 */
async function sendSalaryGuideEmail({ to, name, position }) {
  if (!to) {
    console.warn('[ResendService] No recipient email specified.');
    return { success: false, error: 'No recipient email' };
  }

  const { subject, text, html } = getGuideContent(position, name);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        text,
        html
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[ResendService] Email sent successfully to ${to} for position ${position}. ID: ${data.id}`);
      return { success: true, data };
    } else {
      console.error(`[ResendService] Resend API error (${response.status}):`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('[ResendService] Network/Execution error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSalaryGuideEmail,
  getGuideContent
};
