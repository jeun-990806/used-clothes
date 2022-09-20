const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (request, response) => {
	response.json({
		status: 'success'
	});
});

app.listen(port, () => {
	console.log(`server is listening at port ${port}`);
});

