let mongoose = require("mongoose");
const orderHistorySchema = new mongoose.Schema({
    orderStatusCode: Number,
    orderStatusDescription: String,
    remark: String,
    timestamp: Date,
    creationDate: Date,
});

const itemListSchema = new mongoose.Schema({
    units: Number,
    tax: Number,
    hsn: Number,
    item_name: String,
    sku_id: String,
    item_url: String,
    selling_price: Number,
    brand: String,
});

const shipmentDetailSchema = new mongoose.Schema({
    item_breadth: Number,
    item_length: Number,
    item_height: Number,
    item_weight: Number,
});

const pickupDetailsSchema = new mongoose.Schema({
    pickupTime: Date,
    from_name: String,
    from_phone_number: String,
    from_address: String,
    from_country: String,
    from_email: String,
    from_pincode: String,
    from_city: String,
    from_state: String,
    gstin: String,
});

const deliveryDetailsSchema = new mongoose.Schema({
    to_name: String,
    to_phone_number: String,
    to_address: String,
    to_country: String,
    to_email: String,
    to_pincode: String,
    to_city: String,
    to_state: String,
});

const returnDetailsSchema = new mongoose.Schema({
    name: String,
    phone_number: String,
    address: String,
    country: String,
    email: String,
    pincode: String,
    city: String,
    state: String,
    gstin: String,
    savedFrom: String,
});

const merchantSchema = new mongoose.Schema({
    id: String,
    merchantId: Number,
    name: String,
    email: String,
});

const courierSchema = new mongoose.Schema({
    id: String,
    name: String,
    parent: String,
    cpId: Number,
    cpAccountCode: String,
});

const gstInfoSchema = new mongoose.Schema({
    seller_gstin: String,
    is_seller_registered_under_gst: Boolean,
    _seller_registered_under_gst: Boolean,
});

const patientOrderSchema = new mongoose.Schema(
    {
        message: String,

        // Meta
        meta: {
            message: String,
            status: String,
            success: Boolean,
        },

        // Core order info
        id: String,
        merchantId: Number,
        orderId: String,
        provider: {
            type:String,
            default:'proship'
        },
        orderStatus: String,
        merchantZone: String,
        shippingLabelId: String,
        awbRegisteredDate: Date,
        order_date: String,
        isManualCreate: Boolean,
        reference: String,
        order_type: String,
        patientId: String,
        userId: String,
        statusDate: Date,


        // Relations
        merchant: merchantSchema,
        item_list: [itemListSchema],
        pickup_details: pickupDetailsSchema,
        return_details: returnDetailsSchema,
        delivery_details: deliveryDetailsSchema,
        courier_id: courierSchema,
        shipment_detail: [shipmentDetailSchema],
        gst_info: gstInfoSchema,
        order_history: [orderHistorySchema],

        // Financials
        invoice_value: Number,
        cod_amount: Number,
        client_order_id: String,
        invoice_number: String,
        payment_mode: String,

        // Tracking
        awb_number: String,
        label_url: String,
        reference_number: String,
        security_key: String,
        shipment_type: String,

        // Channel
        channel_name: String,
        is_reverse: Boolean,
    },
    { timestamps: true }
);

module.exports = mongoose.model("patientOrders", patientOrderSchema);
