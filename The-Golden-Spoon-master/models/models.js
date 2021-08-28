const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	meal: String,
	item: String,
	description: String,
	price: Number,
	name: String
});

const Item = mongoose.model('items', ItemSchema);
module.exports.Item = Item;

const UserSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	password: String,
	phnumber: String,
	newsletter: Boolean
});

const User = mongoose.model('user', UserSchema);
module.exports.User = User;

const SubscriberSchema = new Schema({
	email: String
});

const Subscriber = mongoose.model('subscribers', SubscriberSchema);
module.exports.Subscriber = Subscriber;

const CartSchema = new Schema({
	email: String,
	item: String,
	name: String,
	quantity: Number,
	totalprice: Number 
});

const Cart = mongoose.model('cart', CartSchema);
module.exports.Cart = Cart;

const OrderSchema = new Schema({
	email: String,
	item: String,
	name: String,
	quantity: Number,
	totalprice: Number,
	date: String 
});

const Order = mongoose.model('orders', OrderSchema);
module.exports.Order = Order;