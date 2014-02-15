var Displait = (function () {
	var r = {
		displaitIframeRender: {
			name: 'Web Page',
			id: 'displaitIframeRender',
			options: {
				always: function (windowElement, optionsElement) {
					if (!!windowElement.data('refresh')) {
						optionsElement.find('.displait-options-refresh').text('Turn Refresh Off');
					}
				},
				elements: [{
					selector: 'displait-options-refresh',
					text: 'Refresh Every 30 Seconds',
					getText: function () {

					},
					handler: function (windowElement) {
						if (!windowElement.data('refresh')) {
							r.updateWindowData(windowElement.data('guid'), {
								refresh: 30000 // For the time being, 30 seconds only is good enough
							});
							windowElement.data('refresh', 30000);
							windowElement.data('refresh-interval', setInterval(function () {
								windowElement.find('iframe').prop('src', windowElement.find('iframe').prop('src'));
							}, windowElement.data('refresh')));
						} else {
							r.updateWindowData(windowElement.data('guid'), {
								refresh: 0
							});
							clearInterval(windowElement.data('refresh-interval'));
							windowElement.data('refresh', 0);
							windowElement.data('refresh-interval', 0);
						}
						$('.displait-options').remove();
					}
				}]
			},
			getContent: function (windowObject) {
				var content = '<iframe class="display-window-content" src="{{url}}" width="{{width}}" height="{{height}}"></iframe>';
				$.each(windowObject, function (key, value) {
					content = content.replace('{{' + key + '}}', value);
				});
				return content;
			},
			constructWindowSupplements: function (windowElement, windowObject) {
				if (!!windowObject.refresh) {
					windowElement.data('refresh-interval', setInterval(function () {
						windowElement.find('iframe').prop('src', windowElement.find('iframe').prop('src'));
					}, windowObject.refresh)); // For the time being, 30 seconds only is good enough
				}
			}
		},
		windowTemplate: '<div class="displait-window">' +
			'<div class="displait-window-control">' +
				'<a class="fa fa-minus displait-window-control-collapse" title="Hide the window heading"></a>' +
				'<a class="fa fa-plus displait-window-control-show" title="Show the window heading"></a>' +
				'<a class="fa fa-bars displait-window-control-options" title="Show window options"></a>' +
				'<a class="fa fa-times-circle-o displait-window-control-remove" title="Remove this window!"></a>' +
				'<h2>{{name}}</h2>' +
			'</div>' +
			'{{content}}' +
		'</div>',
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
			var forSaving = u.getConfig();

			forSaving.windows.push(obj);
			u.saveConfig(forSaving);
		},
		constructWindows: function (windowObjects) {
			var body = $('body');
			$.each(windowObjects, function (i, windowObject) {
				var windowElement = r.windowTemplate,
					render = r.getRender(windowObject.render);
				$.each(windowObject, function (key, value) {
					windowElement = windowElement.replace('{{' + key + '}}', value);
				});
				windowElement = windowElement.replace('{{content}}', render.getContent(windowObject));

				windowElement = $(windowElement);
				body.append(windowElement);

				windowElement.css({
					left: windowObject.x,
					top: windowObject.y
				});

				windowElement.draggable({
					handle: '.displait-window-control',
//					containment: 'html',
					stack: '.displait-window',
					stop: function (ev, ui) {
						r.updateWindowPosition(windowElement.data('guid'), windowElement.position().top, windowElement.position().left);
					}
				}).resizable({
						handles: 'se',
						ghost: true,
						stop: function (ev, ui) {
							windowElement.css({
								width: ui.size.width + 2
							}).find('.display-window-content').prop({
									width: ui.size.width,
									height: ui.size.height
								});
							r.updateWindowSize(windowElement.data('guid'), ui.size.width, ui.size.height)
						}
					});

				// Supplements
				render.constructWindowSupplements(windowElement, windowObject);

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
					var optionsElement = $('<ul class="displait-options"><ul>');

					$('.displait-options').remove();
					$(this).closest('.displait-window').append(optionsElement);

					optionsElement.on('click', '.displait-options-update', function (ev) {
						ev.preventDefault();

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

					optionsElement.append('<li class="displait-options-update">Update Window Data</li>');
					$.each(render.options.elements, function (i, optionObject) {
						optionsElement.append('<li class="' + optionObject.selector + '">Refresh Every 30 Seconds</li>');

						optionsElement.on('click', '.' + optionObject.selector, function () {
							optionObject.handler(windowElement);
						});
					});
					optionsElement.append('<li class="displait-options-close">Close</li>');

					render.options.always(windowElement, optionsElement);
				});

				windowElement.data(windowObject);
			});
		},
		updateWindowPosition: function (guid, top, left) {
			var fromStorage = u.getConfig();

			$.each(fromStorage.windows, function (i, windowObject) {
				if (windowObject.guid === guid) {
					windowObject.x = left;
					windowObject.y = top;
				}
			});

			u.saveConfig(fromStorage);
		},
		updateWindowSize: function (guid, width, height) {
			var fromStorage = u.getConfig();

			$.each(fromStorage.windows, function (i, windowObject) {
				if (windowObject.guid === guid) {
					windowObject.width = width;
					windowObject.height = height;
				}
			});

			u.saveConfig(fromStorage);
		},
		updateWindowData: function (guid, params) {
			var fromStorage = u.getConfig();

			$.each(fromStorage.windows, function (i, windowObject) {
				if (windowObject.guid === guid) {
					$.each(params, function (key, value) {
						windowObject[key] = value;
					});
				}
			});

			u.saveConfig(fromStorage);
		},
		removeWindow: function (guid) {
			var fromStorage = u.getConfig(),
				newList = [];

			$.each(fromStorage.windows, function (i, windowObject) {
				if (windowObject.guid !== guid) {
					newList.push(windowObject);
				}
			});

			u.saveConfig({renders: fromStorage.renderes, windows: newList});
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
		},
		rendersReady: function (renders) {
			var allReady = true;

			$.each(renders, function (i, render) {
				if (!r.getRender(render).ready) {
					allReady = false;
				}
			});

			return allReady;
		},
		getRender: function (objectName) {
			return window[objectName] || r.displaitIframeRender;
		}
	}, u = {
		log: function () {
			if (window.console && window.console.log) {
				window.console.log.apply(window.console, arguments);
			}
		},
		getConfig: function () {
			var rawResult = localStorage.getItem('displait-config');

			if (!rawResult) {
				localStorage.setItem('displait-config', JSON.stringify({renders: [], windows: []}));
				return {renders: [], windows: []};
			}

			return JSON.parse(rawResult);
		},
		saveConfig: function (config) {
			localStorage.setItem('displait-config', JSON.stringify(config));
		},
		initialize: function () {
			var config = u.getConfig();

			if (!r.rendersReady(config.renders)) {
				setTimeout(u.initialize, 300); // Try again, if the renders aren't ready yet
			} else {
				u.log('Welcome to Displait. Knock yourself out with the windows.');
				r.constructWindows(config.windows);
				r.initAddNew();
			}
		}
	};
	return u;
}());

$(function () {
	if (!!localStorage && !!JSON) {
		Displait.initialize();
	}
});