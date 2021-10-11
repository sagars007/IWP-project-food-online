module.exports.printSess = function(req){
	console.log("Times visited = "+req.session.page_views);
}