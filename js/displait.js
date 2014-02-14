var Displait = (function () {
	var r = {
		windowTemplate: '<div class="displait-window"><div class="displait-window-control"><a class="fa fa-minus displait-window-control-collapse" title="Hide the window heading"><a class="fa fa-plus displait-window-control-show" title="Show the window heading"></a><a class="fa fa-bars displait-window-control-options" title="Show window options"></a><a class="fa fa-times-circle-o displait-window-control-remove" title="Remove this window!"></a><h2>{{name}}</h2></div><iframe src="{{url}}" width="{{width}}" height="{{height}}"></iframe></div>',
		dimScreen: function () {
			var body = $('body'),
				win = $(window),
				lightbox = $('<div class="displait-lightbox"></div>');

			lightbox.on('click', function () {
				r.cleanScreen();
			});

			body.css({
				'overflow': 'hidden',
				'padding': '0 15px 0 0'
			});
			$(document).on('keyup.boxClose', function (ev) {
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
		getSemiGuid: function () { // http://stackoverflow.com/a/2117523
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
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
				var windowElement = r.windowTemplate;
				$.each(windowObject, function (key, value) {
					windowElement = windowElement.replace('{{' + key + '}}', value);
				});

				windowElement = $(windowElement);
				body.append(windowElement);

				windowElement.css({
					left: windowObject.x,
					top: windowObject.y
				});

				windowElement.draggable({
					handle: '.displait-window-control',
					containment: 'parent',
					stop: function (ev, ui) {
						r.updateWindowPosition(windowElement.data('guid'), windowElement.position().top, windowElement.position().left);
					}
				}).resizable({
						handles: 'se',
						ghost: true,
						stop: function (ev, ui) {
							windowElement.css({
								width: ui.size.width + 2
							}).find('iframe').prop({
									width: ui.size.width,
									height: ui.size.height
								});
							r.updateWindowSize(windowElement.data('guid'), ui.size.width, ui.size.height)
						}
					});

				windowElement.on('click', '.displait-window-control-collapse',function (ev) {
					ev.preventDefault();

					$(this).closest('div').css({
						width: 43
					}).find('a:not(.displait-window-control-show), h2').hide();
					$('.displait-window-control-show').show();
				}).on('click', '.displait-window-control-show',function (ev) {
					ev.preventDefault();

					$(this).hide().closest('div').css({
						width: '100%'
					}).find('a:not(.displait-window-control-show), h2').show();
				}).on('click', '.displait-window-control-remove', function (ev) {
					var windowElement = $(this).closest('.displait-window');

					ev.preventDefault();

					r.removeWindow(windowElement.data('guid'));
					windowElement.remove();
				}).on('click', '.displait-window-control-options', function (ev) {
					var optionsElement = $('<ul class="displait-options"><li class="displait-options-update">Update Window Data</li><li class="displait-options-close">Close</li><ul>');

					$('.displait-options').remove();
					$(this).closest('.displait-window').append(optionsElement);

					optionsElement.on('click', '.displait-options-update', function () {
						r.dimScreen();
						r.createAddNewForm(function (form) {
							r.updateWindowData(windowElement.data('guid'), {
								name: form.find('#displait-add-new-form-name').prop('value'),
								url: form.find('#displait-add-new-form-url').prop('value')
							});

							windowElement.find('.displait-window-control h2').text(form.find('#displait-add-new-form-name').prop('value'));
							windowElement.find('iframe').prop('src', form.find('#displait-add-new-form-url').prop('value'));
							r.cleanScreen();
						}, {
							formName: 'Update Window Data',
							name: windowElement.data('name'),
							url: windowElement.data('url'),
							buttonText: 'Update'
						});
					}).on('click', '.displait-options-close', function () {
						$('.displait-options').remove();
					});
				});

				windowElement.data(windowObject);
			});
		},
		updateWindowPosition: function (guid, top, left) {
			var fromStorage = JSON.parse(localStorage.getItem('displait-config'));

			$.each(fromStorage, function (i, windowObject) {
				if (windowObject.guid === guid) {
					windowObject.x = left;
					windowObject.y = top;
				}
			});

			localStorage.setItem('displait-config', JSON.stringify(fromStorage));
		},
		updateWindowSize: function (guid, width, height) {
			var fromStorage = JSON.parse(localStorage.getItem('displait-config'));

			$.each(fromStorage, function (i, windowObject) {
				if (windowObject.guid === guid) {
					windowObject.width = width;
					windowObject.height = height;
				}
			});

			localStorage.setItem('displait-config', JSON.stringify(fromStorage));
		},
		updateWindowData: function (guid, params) {
			var fromStorage = JSON.parse(localStorage.getItem('displait-config'));

			$.each(fromStorage, function (i, windowObject) {
				if (windowObject.guid === guid) {
					$(params, function (key, value) {
						windowObject[key] = value;
					});
				}
			});

			localStorage.setItem('displait-config', JSON.stringify(fromStorage));
		},
		removeWindow: function (guid) {
			var fromStorage = JSON.parse(localStorage.getItem('displait-config')),
				newList = [];

			$.each(fromStorage, function (i, windowObject) {
				if (windowObject.guid !== guid) {
					newList.push(windowObject);
				}
			});

			localStorage.setItem('displait-config', JSON.stringify(newList));
		},
		createNewWindow: function (properties) {
			properties.x = 100;
			properties.y = 100;

			properties.width = 300;
			properties.height = 300;

			r.saveWindow(properties);

			return properties
		},
		cleanScreen: function () {
			$('.displait-lightbox, #displait-add-new-form').remove();
			$('body').css({
				'overflow': 'visible',
				'paddingRight': '0'
			});
			$(document).off('keyup.boxClose');
		},
		getWindowForm: function (params) {
			var formTemplate = '<form action="" method="get" id="displait-add-new-form" class="displait-form">' +
				'<fieldset>' +
					'<legend>{{formName}}</legend>' +
					'<ul>' +
						'<li>' +
							'<label for="displait-add-new-form-name">Window Name</label>' +
							'<input type="text" name="displait-add-new-form-name" id="displait-add-new-form-name" required="required" value="{{name}}" />' +
						'</li>' +
						'<li>' +
							'<label for="displait-add-new-form-url">URL</label>' +
							'<input type="url" name="displait-add-new-form-url" id="displait-add-new-form-url" required="required" value="{{url}}" />' +
						'</li>' +
					'</ul>' +
					'<div>' +
						'<input type="submit" class="displait-button" name="displait-add-new-form-add" id="displait-add-new-form-add" value="{{buttonText}}" />' +
					'</div>' +
					'<a class="fa fa-minus-square-o displait-form-close"></a>' +
				'</fieldset>' +
				'</form>';

			params = params || {
				formName: 'Add New Window',
				name: '',
				url: 'http://',
				buttonText: 'Add'
			};

			$.each(params, function (key, value) {
				formTemplate = formTemplate.replace('{{' + key + '}}', value);
			});

			return formTemplate;
		},
		createAddNewForm: function (submitCallback, formParams) {
			var body = $('body'),
				win = $(window),
				form = $(r.getWindowForm(formParams));

			submitCallback = submitCallback || function () {}; // The latter case will do nothing... But it will not break everything.

			form.on('submit', function (ev) {
				ev.preventDefault();
				submitCallback(form);
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
				r.createAddNewForm(function (form) {
					u.log('Creating new window.');
					r.constructWindows([r.createNewWindow({
						name: form.find('#displait-add-new-form-name').prop('value'),
						guid: r.getSemiGuid(),
						url: form.find('#displait-add-new-form-url').prop('value')
					})]);
					r.cleanScreen();
				});
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