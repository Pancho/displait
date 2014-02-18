var Displait = (function () {
	var r = {
		displaitIframeRender: {
			ready: true,
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
					handler: function (windowElement) {
						if (!windowElement.data('refresh')) {
							r.updateWindowData(windowElement, {
								refresh: 30000 // For the time being, 30 seconds only is good enough
							});
							windowElement.data('refresh', 30000);
							windowElement.data('refresh-interval', setInterval(function () {
								windowElement.find('iframe').prop('src', windowElement.find('iframe').prop('src'));
							}, windowElement.data('refresh')));
						} else {
							r.updateWindowData(windowElement, {
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
			update: function (windowElement) {
				windowElement.find('iframe').prop('src', windowElement.data('url'));
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
			},
			resize: function (ev, ui, windowElement) {
				windowElement.css({
						width: ui.size.width
					}).find('.display-window-content').prop({
						width: ui.size.width,
						height: ui.size.height
					});
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
			var body = $('body'),
				win = $(window);
			$.each(windowObjects, function (i, windowObject) {
				var windowElement = r.windowTemplate,
					render = r.getRender(windowObject.render);
				$.each(windowObject, function (key, value) {
					windowElement = windowElement.replace('{{' + key + '}}', value);
				});
				windowElement = windowElement.replace('{{content}}', render.getContent(windowObject));

				windowElement = $(windowElement);
				windowElement.data(windowObject);
				body.append(windowElement);

				windowElement.css({
					left: Math.min(windowObject.x, win.outerWidth() - windowElement.outerWidth()),
					top: Math.min(windowObject.y, win.outerHeight() - windowElement.outerHeight())
				});

				windowElement.draggable({
					handle: '.displait-window-control',
					containment: 'body',
					stack: '.displait-window',
					stop: function (ev, ui) {
						r.updateWindowPosition(windowElement.data('guid'), windowElement.position().top, windowElement.position().left);
					}
				}).resizable({
						handles: 'se',
						containment: 'html',
						ghost: true,
						stop: function (ev, ui) {
							render.resize(ev, ui, windowElement);
							r.updateWindowSize(windowElement.data('guid'), ui.size.width, ui.size.height);
							$("div.ui-resizable-iframeFix").each(function () {
								this.parentNode.removeChild(this);
							}); //Remove frame helpers
						},
						start: function (event, ui) {
							windowElement.find("iframe").each(function () {
								$('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>')
									.css({
										width: this.offsetWidth + "px", height: this.offsetHeight + "px",
										position: "absolute", opacity: "0.001", zIndex: 1000
									}).css($(this).offset()).appendTo("body");
							});
						}
					});

				// Supplements
				render.constructWindowSupplements(windowElement, windowObject);

				windowElement.on('click', '.displait-window-control-collapse',function (ev) {
					var control = $(this);
					$('.displait-options').remove();
					ev.preventDefault();

					control.closest('div').css({
						width: 43
					});
					control.closest('div').find('a:not(.displait-window-control-show), h2').hide();
					$('.displait-window-control-show').show();
				}).on('click', '.displait-window-control-show',function (ev) {
					var control = $(this);
					ev.preventDefault();

					control.hide().closest('div').css({
						width: '100%'
					});
					control.closest('div').find('a:not(.displait-window-control-show), h2').show();
				}).on('click', '.displait-window-control-remove', function (ev) {
					var windowElement = $(this).closest('.displait-window');

					ev.preventDefault();

					r.removeWindow(windowElement.data('guid'));
					windowElement.remove();
				}).on('click', '.displait-window-control-options', function (ev) {
					var optionsElement = $('<ul class="displait-options"><ul>');

					if (windowElement.find('.displait-options').length === 0) { // Do this only if the options are not present already, otherwise just "close"
						$('.displait-options').remove();
						$(this).closest('.displait-window').append(optionsElement);

						optionsElement.on('click', '.displait-options-update', function (ev) {
							ev.preventDefault();

							r.dimScreen();
							r.createWindowForm(function (form) {
								r.updateWindowData(windowElement, {
									name: form.find('#displait-add-new-form-name').prop('value'),
									url: form.find('#displait-add-new-form-url').prop('value'),
									render: form.find('#displait-add-new-form-render :selected').prop('value')
								});

								windowElement.find('.displait-window-control h2').text(form.find('#displait-add-new-form-name').prop('value'));
								windowElement.find('iframe').prop('src', form.find('#displait-add-new-form-url').prop('value'));
								render.update(windowElement);
								r.cleanScreen();
							}, {
								formName: 'Update Window Data',
								name: windowElement.data('name'),
								url: windowElement.data('url'),
								selected: windowElement.data('render'),
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
					} else {
						$('.displait-options').remove();
					}
				});
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
		updateWindowData: function (windowElement, params) {
			var fromStorage = u.getConfig();

			$.each(fromStorage.windows, function (i, windowObject) {
				if (windowObject.guid === windowElement.data('guid')) {
					$.each(params, function (key, value) {
						windowElement.data(key, value);
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

			u.saveConfig({renders: fromStorage.renders, windows: newList});
		},
		createNewWindow: function (properties) {
			var allWindowsCount = $('.displait-window').length;
			properties.x = 100 + allWindowsCount * 10;
			properties.y = 100 + allWindowsCount * 10;

			properties.width = 300;
			properties.height = 300;

			r.saveWindow(properties);

			return properties
		},
		cleanScreen: function () {
			$('.displait-lightbox, .displait-form').remove();
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
						'<li>' +
							'<label for="displait-add-new-form-render">Type</label>' +
							'<select id="displait-add-new-form-render" name="displait-add-new-form-render"></select>' +
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
				buttonText: 'Add',
				selected: 'displaitIframeRender'
			};

			$.each(params, function (key, value) {
				formTemplate = formTemplate.replace('{{' + key + '}}', value);
			});

			return formTemplate;
		},
		createWindowForm: function (submitCallback, formParams) {
			var body = $('body'),
				win = $(window),
				form = $(r.getWindowForm(formParams));

			form.find('#displait-add-new-form-render').append('<option value="displaitIframeRender"' + (!formParams || !formParams.selected || formParams.selected === 'displaitIframeRender' ? ' selected="selected"': '') + '>Web Page</option>');
			$.each(u.getConfig().renders, function (i, render) {
				var renderOption = window[render];
				form.find('#displait-add-new-form-render').append('<option value="' + renderOption.id + '"' + (formParams && formParams.selected === renderOption.id ? ' selected="selected"': '') + '>' + renderOption.name + '</option>');
			});

			submitCallback = submitCallback || function () {}; // The latter case will do nothing... But it will not break everything.

			form.on('submit', function (ev) {
				ev.preventDefault();
				submitCallback(form);
			});

			form.on('click', '.displait-form-close', function () {
				r.cleanScreen();
			});

			body.append(form);

			form.on('focus', 'input, select', function () {
				$(this).closest('li').addClass('displait-focus');
			});

			form.on('blur', 'input, select', function () {
				$(this).closest('li').removeClass('displait-focus');
			});

			form.css({
				'top': Math.max(0, parseInt((win.height() / 2) - (form.outerHeight() / 2))),
				'left': Math.max(0, parseInt((win.width() / 2) - (form.outerWidth() / 2)))
			});
		},
		initAddNew: function () {
			var body = $('body');
			body.append('<a id="displait-add-new" class="displait-button" title="Click here to add a new window"><span class="fa fa-plus-circle"></span>Add New Window</a>');

			body.on('click', '#displait-add-new', function (ev) {
				ev.preventDefault();

				r.dimScreen();
				r.createWindowForm(function (form) {
					u.log('Creating new window.');
					r.constructWindows([r.createNewWindow({
						name: form.find('#displait-add-new-form-name').prop('value'),
						guid: r.getSemiGuid(),
						url: form.find('#displait-add-new-form-url').prop('value'),
						render: form.find('#displait-add-new-form-render :selected').prop('value')
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
		},
		updateBodyDimensions: function () {
			var win = $(window);

			$('body').css({
				width: win.outerWidth(),
				height: win.outerHeight()
			})
		},
		monitorBody: function () {
			r.updateBodyDimensions();
			$(window).on('resize', r.updateBodyDimensions);
		},
		initImportExport: function () {
			var body = $('body'),
				win = $(window),
				compressed = window.location.search,
				originalConfig = u.getConfig(),
				form = '<form id="displait-share-form" class="displait-form" method="get" action="mailto:email@example.net" enctype="text/plain">' +
						'<fieldset>' +
							'<legend>Share your dashboard</legend>' +
							'<ul>' +
								'<li>' +
									'<label for="displait-share-email">{{message}}</label>' +
									'<textarea cols="1" rows="5" name="displait-share" id="displait-share" required="required">{{content}}</textarea>' +
								'</li>' +
							'</ul>' +
							'{{import}}' +
							'<a class="fa fa-minus-square-o displait-form-close"></a>' +
						'</fieldset>' +
					'</form>';

			body.append('<a id="displait-export" class="displait-button" title="Export your dashboard"><span class="fa fa-upload"></span></a>');
			body.append('<a id="displait-import" class="displait-button" title="Import a dashboard"><span class="fa fa-download"></span></a>');

			$('#displait-export').on('click', function (ev) {
				var configString = LZString.compressToBase64(JSON.stringify(u.getConfig())),
					formElement = form;

				if (configString.length < 1600) { // Should be enough, so we don't tire IE
					formElement = formElement.replace('{{message}}', 'Just copy and send this url (we know it\'s weird) to the person you want to share your dashboard with.');
					formElement = formElement.replace('{{content}}', window.location.href + '?c=' + configString);
				} else {
					formElement = formElement.replace('{{message}}', 'Just copy and send this text (we know it\'s weird) to the person you want to share your dashboard with and tell them to import it.');
					formElement = formElement.replace('{{content}}', configString);
				}
				formElement = formElement.replace('{{import}}', '');

				formElement = $(formElement);

				formElement.on('submit', function (ev) {
					ev.preventDefault();
				});

				formElement.on('click', '.displait-form-close', function () {
					r.cleanScreen();
				});

				formElement.on('blur', 'textarea', function () {
					$(this).closest('li').removeClass('displait-focus');
				});

				formElement.on('focus', 'textarea', function () {
					$(this).closest('li').addClass('displait-focus');
				});

				r.dimScreen();
				body.append(formElement);

				formElement.find('#displait-share').select();

				formElement.css({
					'top': Math.max(0, parseInt((win.height() / 2) - (formElement.outerHeight() / 2))),
					'left': Math.max(0, parseInt((win.width() / 2) - (formElement.outerWidth() / 2)))
				});
			});

			$('#displait-import').on('click', function (ev) {
				var formElement = form;

				formElement = formElement.replace('{{message}}', 'Paste the text you received into the field below and click the Import button');
				formElement = formElement.replace('{{content}}', '');
				formElement = formElement.replace('{{import}}', '<div><input type="submit" class="displait-button" name="displait-share-import" id="displait-share-import" value="Import" /></div>');

				formElement = $(formElement);

				formElement.on('submit', function (ev) {
					ev.preventDefault();

					compressed = LZString.decompressFromBase64(formElement.find('#displait-share').prop('value'));
					if (!!compressed) {
						try {
							compressed = JSON.parse(compressed);
							if (!!compressed.windows && !!compressed.renders) { // Basic validation
								u.archiveConfig(originalConfig);
								u.saveConfig(compressed);
								window.location.reload(); // Reload the page so the new settings kick in
							} else {
								u.log('Invalid JSON, Displait incompatible');
							}
						} catch (e) {
							u.log('Failed to parse the text config');
							u.saveConfig(originalConfig);
							throw e;
						}
					}
				});

				formElement.on('click', '.displait-form-close', function () {
					r.cleanScreen();
				});

				formElement.on('blur', 'textarea', function () {
					$(this).closest('li').removeClass('displait-focus');
				});

				formElement.on('focus', 'textarea', function () {
					$(this).closest('li').addClass('displait-focus');
				});

				r.dimScreen();
				body.append(formElement);

				formElement.css({
					'top': Math.max(0, parseInt((win.height() / 2) - (formElement.outerHeight() / 2))),
					'left': Math.max(0, parseInt((win.width() / 2) - (formElement.outerWidth() / 2)))
				});
			});

			compressed = compressed.substring(3);
			compressed = LZString.decompressFromBase64(compressed);
			if (!!compressed) {
				try {
					compressed = JSON.parse(compressed);
					if (!!compressed.windows && !!compressed.renders) {
						u.archiveConfig(originalConfig);
						u.saveConfig(compressed);
						window.location.href = window.location.href.split('?c=')[0]; // Reload the page without the ballast from loading
					} else {
						u.log('Invalid JSON, Displait incompatible');
					}
				} catch (e) {
					u.log('Failed to parse the url');
					u.saveConfig(originalConfig);
					throw e;
				}
			}
		}
	}, u = {
		log: function () {
			if (window.console && window.console.log) {
				window.console.log.apply(window.console, arguments);
			}
		},
		getConfig: function () {
			var rawResult = localStorage.getItem('displait-config') || '{}',
				parsed = JSON.parse(rawResult),
				newConfig = {renders: [], windows: []};

			if (!rawResult) {
				localStorage.setItem('displait-config', JSON.stringify({renders: [], windows: []}));
				u.saveConfig(newConfig);
				return newConfig;
			}
			if (!parsed.windows || !parsed.renders) {
				u.saveConfig(newConfig);
				return newConfig;
			}

			return JSON.parse(rawResult);
		},
		saveConfig: function (config) {
			localStorage.setItem('displait-config', JSON.stringify(config));
		},
		archiveConfig: function (config) {
			localStorage.setItem('displait-config-' + r.getSemiGuid(), JSON.stringify(config));
		},
		initialize: function () {
			var config = u.getConfig();

			if (!r.rendersReady(config.renders)) {
				setTimeout(u.initialize, 300); // Try again, if the renders aren't ready yet
			} else {
				u.log('Welcome to Displait. Knock yourself out with the windows.');
				r.initImportExport();
				r.monitorBody();
				r.constructWindows(config.windows);
				r.initAddNew();
			}
		}
	};
	return u;
}());

$(function () {
	if (!!localStorage && !!JSON && !!LZString) {
		Displait.initialize();
	}
});