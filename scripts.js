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
	// Using RSS2JSON free tier to parse Fox News RSS feed (no API key needed for basic usage)
	var rssUrl = encodeURIComponent('https://moxie.foxnews.com/google-publisher/latest.xml');
	var url = 'https://api.rss2json.com/v1/api.json?rss_url=' + rssUrl;

	$.ajax({
		url: url,
		method: 'GET',
	}).done(function(result) {
		console.log('Fox News Response:', result);
		if(result.status === 'ok' && result.items && result.items.length > 0) {
			// Filter articles by search term
			var filtered = result.items.filter(function(item) {
				var searchLower = input.toLowerCase();
				return item.title.toLowerCase().includes(searchLower) ||
				       (item.description && item.description.toLowerCase().includes(searchLower));
			});

			if(filtered.length > 0) {
				for(var i = 0; i < Math.min(10, filtered.length); i++){
					var articleUrl = filtered[i]['link'];
					var title = filtered[i]['title'];
					$(".right").append('<a class="result" href="' + articleUrl + '" target="_blank">' + title + '</a>');
				}
			} else {
				$(".right").append('<p>No Fox News articles found for "' + input + '"</p>');
			}
		} else {
			$(".right").append('<p>No Fox News articles found</p>');
		}
	}).fail(function(err) {
		console.error('Fox News Error:', err);
		$(".right").append('<p>Error loading Fox News articles. Try again later.</p>');
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
