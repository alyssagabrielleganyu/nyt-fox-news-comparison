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
	// Using multiple Fox News RSS feeds for better coverage
	var feeds = [
		'https://moxie.foxnews.com/google-publisher/latest.xml',
		'https://moxie.foxnews.com/google-publisher/politics.xml',
		'https://moxie.foxnews.com/google-publisher/us.xml',
		'https://moxie.foxnews.com/google-publisher/world.xml'
	];

	var allArticles = [];
	var completedFeeds = 0;

	feeds.forEach(function(feedUrl) {
		var url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);

		$.ajax({
			url: url,
			method: 'GET',
		}).done(function(result) {
			if(result.status === 'ok' && result.items) {
				// Filter articles by search term
				var filtered = result.items.filter(function(item) {
					var searchLower = input.toLowerCase();
					return item.title.toLowerCase().includes(searchLower) ||
					       (item.description && item.description.toLowerCase().includes(searchLower));
				});
				allArticles = allArticles.concat(filtered);
			}
		}).always(function() {
			completedFeeds++;
			if(completedFeeds === feeds.length) {
				// All feeds loaded, display results
				console.log('Fox News Response:', allArticles);
				if(allArticles.length > 0) {
					// Remove duplicates by URL
					var seen = {};
					var unique = allArticles.filter(function(item) {
						if(seen[item.link]) return false;
						seen[item.link] = true;
						return true;
					});

					for(var i = 0; i < Math.min(10, unique.length); i++){
						var articleUrl = unique[i]['link'];
						var title = unique[i]['title'];
						$(".right").append('<a class="result" href="' + articleUrl + '" target="_blank">' + title + '</a>');
					}
				} else {
					$(".right").append('<p>No recent Fox News articles found for "' + input + '"</p>');
				}
			}
		});
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
