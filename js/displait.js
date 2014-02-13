var Displait = (function () {
	var r = {
		windowTemplate: '<div class="displait-window"><div class="displait-window-control"><a class="fa fa-bars"></a><h2>{{name}}</h2></div><iframe src="{{url}}" width="{{width}}" height="{{height}}"></iframe></div>',
		dimScreen: function () {
			var body = $('body'),
				win = $(window),
				lightbox = $('<div class="displait-lightbox"></div>');

			lightbox.on('click', function () {
				r.cleanScreen();
			});

			body.css({
				'overflow': 'hidden',
				'paddingRight': '15px'
			});
			$(document).on('keyup.boxClose', function(ev) {
				if (ev.keyCode == 27) {
					r.cleanScreen();
				}
			});

			body.append(lightbox);
			lightbox.css({
				'height': win.outerHeight(),
				'width': win.outerWidth()
			});
		},
		saveWindow: function (obj) {
			var forSaving = JSON.parse(localStorage.getItem('displait-config'));

			forSaving.push(obj);
			localStorage.setItem('displait-config', JSON.stringify(forSaving));
		},
		constructWindows: function (windowObjects) {
			var body = $('body');
			$.each(windowObjects, function (i, windowObject) {
				console.log(windowObject);
				var windowElement = r.windowTemplate;
				$.each(windowObject, function (key, value) {
					u.log(key, value);
					windowElement = windowElement.replace('{{' + key + '}}', value);
				});

				windowElement = $(windowElement);
				body.append(windowElement);

				windowElement.css({
					left: windowElement.x,
					top: windowElement.y
				});
			});
		},
		createNewWindow: function (properties) {
			properties.x =  20;
			properties.y =  20;

			properties.width = 300;
			properties.height = 300;

			r.saveWindow(properties);
		},
		cleanScreen: function () {
			$('.displait-lightbox, #displait-add-new-form').remove();
			$('body').css({
				'overflow': 'visible',
				'paddingRight': '0'
			});
			$(document).off('keyup.boxClose');
		},
		createAddNewForm: function () {
			var body = $('body'),
				win = $(window),
				form = $('<form action="" method="get" id="displait-add-new-form" class="displait-form">' +
						'<fieldset>' +
							'<legend>Add New Window</legend>' +
							'<ul>' +
								'<li>' +
									'<label for="displait-add-new-form-name">Window Name</label>' +
									'<input type="text" name="displait-add-new-form-name" id="displait-add-new-form-name" required="required" value="" />' +
								'</li>' +
								'<li>' +
									'<label for="displait-add-new-form-url">URL</label>' +
									'<input type="url" name="displait-add-new-form-url" id="displait-add-new-form-url" required="required" value="" />' +
								'</li>' +
							'</ul>' +
							'<div>' +
								'<input type="submit" class="displait-button" name="displait-add-new-form-add" id="displait-add-new-form-add" value="Add" />' +
							'</div>' +
							'<a class="fa fa-minus-square-o displait-form-close"></a>' +
						'</fieldset>' +
					'</form>');

				form.on('submit', function (ev) {
					ev.preventDefault();

					u.log('Creating new window.');
					r.createNewWindow({
						name: form.find('#displait-add-new-form-name').prop('value'),
						url: form.find('#displait-add-new-form-url').prop('value')
					});
				});

				form.on('click', '.displait-form-close', function () {
					r.cleanScreen();
				});

				body.append(form);

				form.on('focus', 'input', function () {
					$(this).closest('li').addClass('displait-focus');
				});

				form.on('blur', 'input', function () {
					$(this).closest('li').removeClass('displait-focus');
				});

				form.css({
					'top': Math.max(0, parseInt((win.height() / 2) - (form.outerHeight() / 2))),
					'left': Math.max(0, parseInt((win.width() / 2) - (form.outerWidth() / 2)))
				});
		},
		initAddNew: function () {
			var body = $('body');
			body.append('<a id="displait-add-new" class="displait-button"><span class="fa fa-plus-circle"></span>Add New Window</a>');

			body.on('click', '#displait-add-new', function (ev) {
				ev.preventDefault();

				r.dimScreen();
				r.createAddNewForm();
			});
		}
	}, u = {
		log: function () {
			if (window.top.console && window.top.console.log) {
				window.top.console.log.apply(window.top.console, arguments);
			}
		},
		initialize: function () {
			u.log('Welcome to Displait. Knock yourself out with the windows.');

			if (!localStorage.getItem('displait-config')) {
				localStorage.setItem('displait-config', JSON.stringify([]));
			}

			r.constructWindows(JSON.parse(localStorage.getItem('displait-config')));
			r.initAddNew();

			return this;
		}
	};
	return u;
}());

$(function () {
	if (!!localStorage || !!JSON) {
		Displait.initialize();
	}
});