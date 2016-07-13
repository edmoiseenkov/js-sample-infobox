(function ($) {

	$.fn.infoBox = function (options) {
		var self = this,
			data = [],
			currentSlideIndex = 0,
			savedDescriptionHeight = 0,
			lockShowDetailsClick = false;

		options = $.extend({
			dataUrl: [],
			prevBtnSelector: '.btn-prev',
			nextBtnSelector: '.btn-next'
		}, options);

		options.prevBtnSelector = (typeof options.prevBtnSelector == 'string') ? $(options.prevBtnSelector) : options.prevBtnSelector;
		options.nextBtnSelector = (typeof options.nextBtnSelector == 'string') ? $(options.nextBtnSelector) : options.nextBtnSelector;

		var $container = self.find('.container'),
			$controls = $container.find('.controls');

		if (options.dataUrl) {
			$controls.hide();
			$.ajax({
				url: options.dataUrl,
				success: function(json) {
					data = json;
					render();
				},
				error: function() {
					renderError('Error loading data... ;(');
				}
			});
		}

		function render() {

			$controls.show();

			$.each(data, function(i, product) {
				var html =
				'<div class="slide">' +
					'<div class="image">' +
						'<img src="./src/img/' + product.img + '" alt="' + product.title + '" />' +
					'</div>' +

					'<div class="content">' +
						'<h3>' + product.title + '</h3>' +

						'<div class="body">' +
							'<p class="description">' + product.description + '</p>' +
							'<p class="note">' + product.note + '</p>' +
						'</div>' +
					'</div>' +
				'</div>';


				self.find('.slides').append(html);
			});

			self.find('.slide').hide();
			goToSlide(currentSlideIndex);

			options.prevBtnSelector.on('click', function() {
				prevSlide();
			});
			options.nextBtnSelector.on('click', function() {
				nextSlide();
			});

			$('.toggle-details a.show').on('click', function() {
				!lockShowDetailsClick && showDetails();
			});
			$('.toggle-details a.hide').on('click', function() {
				!lockShowDetailsClick && hideDetails();
			});
		}
		function renderError(text) {
			var $error = self.find('.error');
			$error.css('display', 'table');
			$error.text(text);
		}

		function prevSlide() {
			goToSlide((currentSlideIndex == 0) ? data.length - 1 : currentSlideIndex - 1);
		}
		function nextSlide() {
			goToSlide((currentSlideIndex + 1 >= data.length) ? 0 : currentSlideIndex + 1);
		}
		function goToSlide(index) {
			if (self.hasClass('full-details')) {
				hideDetails();
			}

			$(self.find('.slide').get(currentSlideIndex)).fadeOut({
				complete: function() {
					currentSlideIndex = index;
					var $slide = $(self.find('.slide').get(currentSlideIndex));
					$slide.fadeIn();
					self.find('.main-action-button').attr('href', '#' + data[currentSlideIndex]['productUrl']);
				}
			});
		}

		function showDetails() {
			lockShowDetailsClick = true;

			var $slide = $($container.find('.slide').get(currentSlideIndex)),
				$content = $slide.find('.content'),
				$imageBlock = $slide.find('.image'),
				$body = $slide.find('.body'),
				$note = $content.find('.note');

			$imageBlock.fadeOut({
				complete: function() {
					$container.css('padding-top', $imageBlock.height() + 'px');
				}
			});

			$content.animate({ marginTop: -($imageBlock.height() - 15) }, {
				complete: function() {

					var maxBodyHeight = $controls.position().top - $body.position().top;

					savedDescriptionHeight = $body.height();
					$body.height(maxBodyHeight);

					$note.slideDown({
						complete: function() {
							self.addClass('full-details');

							if ($body[0].scrollHeight > maxBodyHeight) {
								$body.addClass('scroll-box')
							}
							lockShowDetailsClick = false;
						}
					});
				}
			});
		}
		function hideDetails() {
			var $slide = $($container.find('.slide').get(currentSlideIndex)),
				$content = $slide.find('.content'),
				$imageBlock = $slide.find('.image'),
				$body = $slide.find('.body'),
				$note = $content.find('.note');

			$note.hide();
			$body.scrollTop(0);
			$body.removeClass('scroll-box');
			$body.css('height', savedDescriptionHeight + 'px');

			$content.animate({
				marginTop: 0
			}, function() {
				$container.css('padding-top', '0');
				$imageBlock.fadeIn();
			});


			$.when($imageBlock.promise(), $content.promise(), $note.promise()).done(function() {
				self.removeClass('full-details');
			});
		}

		return this;
	};

}(jQuery));