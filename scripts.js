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
	$(".left").addClass('has-articles');
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
	var hasError = false;

	feeds.forEach(function(feedUrl) {
		var url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);

		$.ajax({
			url: url,
			method: 'GET',
			timeout: 5000
		}).done(function(result) {
			console.log('Fox News feed loaded:', feedUrl, result);
			if(result.status === 'ok' && result.items) {
				// Filter articles by search term
				var filtered = result.items.filter(function(item) {
					var searchLower = input.toLowerCase();
					return item.title.toLowerCase().includes(searchLower) ||
					       (item.description && item.description.toLowerCase().includes(searchLower));
				});
				allArticles = allArticles.concat(filtered);
			}
		}).fail(function(err) {
			console.error('Fox News feed error:', feedUrl, err);
			hasError = true;
		}).always(function() {
			completedFeeds++;
			if(completedFeeds === feeds.length) {
				// All feeds loaded, display results
				console.log('Fox News final articles:', allArticles);
				if(allArticles.length > 0) {
					// Remove duplicates by URL
					var seen = {};
					var unique = allArticles.filter(function(item) {
						if(seen[item.link]) return false;
						seen[item.link] = true;
						return true;
					});

					$(".right").addClass('has-articles');
					for(var i = 0; i < Math.min(10, unique.length); i++){
						var articleUrl = unique[i]['link'];
						var title = unique[i]['title'];
						$(".right").append('<a class="result" href="' + articleUrl + '" target="_blank">' + title + '</a>');
					}
				} else {
					if(hasError) {
						$(".right").append('<p>Error loading Fox News articles. Please try again.</p>');
					} else {
						$(".right").append('<p>No recent Fox News articles found for "' + input + '"</p>');
					}
				}
			}
		});
	});
};


$("#searchInput").change(function(){
	var input = $("#searchInput").val();
	$(".left").html("").removeClass('has-articles');
	$(".right").html("").removeClass('has-articles');
	getNYTArticles(input);
	getFoxArticles(input)
});

$("#search").click(function(){
	var input = $("#searchInput").val();
	$(".left").html("").removeClass('has-articles');
	$(".right").html("").removeClass('has-articles');
	getNYTArticles(input);
	getFoxArticles(input)
});

// Dynamic suggestion pills based on current Fox News topics
// This function analyzes today's Fox News RSS feeds and suggests
// the most common topics that are being covered right now.
// Suggestions will automatically update as news cycles change.
function generateSuggestions() {
	var feeds = [
		'https://moxie.foxnews.com/google-publisher/latest.xml',
		'https://moxie.foxnews.com/google-publisher/politics.xml',
		'https://moxie.foxnews.com/google-publisher/us.xml',
		'https://moxie.foxnews.com/google-publisher/world.xml'
	];

	var allText = '';
	var completedFeeds = 0;

	// Common words to filter out
	var stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'as', 'by', 'with', 'from', 'says', 'after', 'over', 'amid', 'about', 'out', 'up', 'new', 'us', 'how', 'who', 'what', 'when', 'where', 'why', 'more', 'fox', 'news', 'report', 'could', 'would', 'should'];

	feeds.forEach(function(feedUrl) {
		var url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);

		$.ajax({
			url: url,
			method: 'GET',
			timeout: 5000
		}).done(function(result) {
			if(result.status === 'ok' && result.items) {
				result.items.forEach(function(item) {
					allText += ' ' + item.title.toLowerCase() + ' ' + (item.description || '').toLowerCase();
				});
			}
		}).always(function() {
			completedFeeds++;
			if(completedFeeds === feeds.length) {
				// Extract and count keywords
				var words = allText.match(/\b[a-z]{4,}\b/g) || [];
				var wordCount = {};

				words.forEach(function(word) {
					if(!stopWords.includes(word)) {
						wordCount[word] = (wordCount[word] || 0) + 1;
					}
				});

				// Sort by frequency and get top keywords
				var sortedWords = Object.keys(wordCount).sort(function(a, b) {
					return wordCount[b] - wordCount[a];
				});

				// Take top 6 unique, meaningful terms
				var suggestions = sortedWords.slice(0, 8).filter(function(word) {
					return wordCount[word] >= 2; // Must appear at least twice
				}).slice(0, 6);

				// Fallback suggestions if not enough found
				if(suggestions.length < 3) {
					suggestions = ['trump', 'iran', 'israel', 'china', 'war', 'police'];
				}

				// Generate pills
				$('.suggestions').empty();
				$('.suggestions').append('<span class="suggestion-label">Try searching <span style="font-weight: 400;">(popular topics today)</span>:</span>');

				suggestions.forEach(function(term) {
					var pill = $('<button class="suggestion-pill" data-term="' + term + '">' +
						term.charAt(0).toUpperCase() + term.slice(1) + '</button>');

					pill.click(function() {
						var searchTerm = $(this).attr('data-term');
						$("#searchInput").val(searchTerm);
						$(".left").html("").removeClass('has-articles');
						$(".right").html("").removeClass('has-articles');
						getNYTArticles(searchTerm);
						getFoxArticles(searchTerm);
					});

					$('.suggestions').append(pill);
				});

				console.log('Generated suggestions:', suggestions, 'from word counts:', wordCount);
			}
		});
	});
}

// Generate suggestions on page load
$(document).ready(function() {
	generateSuggestions();
});

$(".suggestion-pill").click(function(){
	var term = $(this).attr('data-term');
	$("#searchInput").val(term);
	$(".left").html("").removeClass('has-articles');
	$(".right").html("").removeClass('has-articles');
	getNYTArticles(term);
	getFoxArticles(term);
});
