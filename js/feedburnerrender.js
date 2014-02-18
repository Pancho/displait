var DisplaitFeedBurner = (function () {
	var r = {
		backgroundsClasses: [
			'background1',
			'background2',
			'background3',
			'background4',
			'background5'
		],
		refreshFeed: function (windowElement) {
			$.ajax({
				url: 'http://ajax.googleapis.com/ajax/services/feed/load',
				method: 'GET',
				dataType: 'jsonp',
				data: {
					v: '1.0',
					q: windowElement.data('url')
				},
				success: function (data) {
					try {
						u.renderFeed(windowElement, data.responseData.feed.entries);
					} catch (e) {
						u.renderFeed(windowElement, [{
							title: 'Error',
							link: '',
							contentSnippet: 'When loading the RSS feed we have encountered an error. Please check if the url is OK.',
							author: 'Displait Feed Burner Render'
						}]);
					}
				}
			})
		},
		register: function () {
			var rawStorage = localStorage.getItem('displait-config'),
				parsed = JSON.parse(rawStorage),
				registered = false;

			$.each(parsed.renders, function (i, render) {
				if (render === u.id) {
					registered = true;
				}
			});

			if (!registered) {
				parsed.renders.push(u.id);
			}

			localStorage.setItem('displait-config', JSON.stringify(parsed));
		},
		shuffle: function (array) { //http://stackoverflow.com/a/2450976
			var currentIndex = array.length, temporaryValue, randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		}
	}, u = {
		name: 'RSS Stream',
		id: 'DisplaitFeedBurner',
		ready: false,
		options: {
			always: function (windowElement, optionsElement) {},
			elements: []
		},
		getContent: function (windowObject) {
			return '<div class="display-window-content displait-window-content-rss" style="width:' + windowObject.width + 'px;height:' + windowObject.height + 'px;"></div>';
		},
		constructWindowSupplements: function (windowElement, windowObject) {
			windowElement.data('DisplaitFeedBurner-interval', setInterval(function () {
				r.refreshFeed(windowElement);
			}, 300000));
			r.refreshFeed(windowElement);
		},
		update: function (windowElement) {
			r.refreshFeed(windowElement);
		},
		renderFeed: function (windowElement, feed) {
			var list = $('<ul>');

			$.each(feed, function (i, post) {
				var postDate = (function () {
					var dateParts = post.publishedDate && post.publishedDate.split(', ')[1].split(' ') || ['', '', ''];
						return dateParts[0] + ' ' + dateParts[1] + ' ' + dateParts[2];
					}()), title = post.title.length > 50 && post.title.substring(0, 50) + '&hellip;' || post.title;
				list.append('<li class="' + r.backgroundsClasses[i % 5] + '"><a target="_blank" href="' + post.link + '"><h5>' + title + '</h5><p>' + post.contentSnippet + '</p><span>' + post.author + ', ' + postDate + '</span></a></li>');
			});

			windowElement.find('.displait-window-content-rss').empty().append(list);
		},
		resize: function (ev, ui, windowElement) {
			windowElement.css({
					width: ui.size.width
				}).find('.display-window-content').css({
					width: ui.size.width,
					height: ui.size.height
				});
		},
		initialize: function () {
			$('head').append('<link href="css/feedburnerrender.css" rel="stylesheet" type="text/css">');
			r.register();
			r.backgroundsClasses = r.shuffle(r.backgroundsClasses);

			u.ready = true;
		}
	};
	return u;
}());

$(function () {
	DisplaitFeedBurner.initialize();
});