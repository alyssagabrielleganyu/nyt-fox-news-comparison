function getNYTArticles(input) {
	var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
	url += '?' + $.param({
	  'api-key': "UDvYjIrEQ7rtnQKAjVfGt5kehN9kJI9CzGvZhkzWuz00d4vE",
	  'q': input
	});
	$.ajax({
	  url: url,
	  method: 'GET',
	}).done(function(result) {



console.log('NYT Response:', result);
$("#resultParagraph").html("")
if(result.response && result.response.docs && result.response.docs.length > 0) {
	for (var i = 0 ; i < Math.min(10, result.response.docs.length); i++) {
		var url = result.response.docs[i]['web_url'];
		var headline = result.response.docs[i]['headline']['main'];
		$(".left").append('<a class="result" href="' + url + '" target="_blank">' + headline + '</a>');
		console.log(url)
	}
} else {
	$(".left").append('<p>No NYT articles found</p>');
}
}).fail(function(err) {
	console.error('NYT Error:', err);
	$(".left").append('<p>Error loading NYT articles</p>');
});
}	

function getFoxArticles(input) {
		//FOX API 
	var url = 'https://newsapi.org/v2/everything?' +
          'q=' + input + '&' +
          //'from=2018-10-01&' +
          'sortBy=popularity&' +
          'sources=fox-news&' +
          'apiKey=74c66a35ffaa45ec95dc8060fd17efd2';


	var req = new Request(url);
	$.ajax({
	  url: url,
	  method: 'GET',
	}).done(function(result) {
		for(var i = 0; i < Math.min(10, result.articles.length); i++){
			var url = result.articles[i]['url'];
			var title = result.articles[i]['title'];
			$(".right").append('<a class="result" href="' + url + '" target="_blank">' + title + '</a>');
		}
	});


};


$("#searchInput").change(function(){
	var input = $("#searchInput").val();
	$(".left").html("")
	$(".right").html("")
	getNYTArticles(input);
	getFoxArticles(input)
});

$("#search").click(function(){
	var input = $("#searchInput").val();
	$(".left").html("")
	$(".right").html("")
	getNYTArticles(input);
	getFoxArticles(input)
});
