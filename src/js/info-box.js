
// Для старых браузеров которые не поддерживают метод bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function(ctx) {
		var fn = this;
		return function() {
			fn.apply(ctx, arguments);
		};
	};
}

var _createSimpleClass = function(constructor, source) {
	var _class = constructor,
		_prototype = _class.prototype || {};
	
	for (var property in source) {
		_prototype[property] = source[property];
	}
	
	_class.prototype = _prototype;
	
	return _class;
};

var InfoBox = _createSimpleClass(function(options) {
	this.init(options);
}, {
	animationMilliseconds: 1000,
	prevButtonText: 'Prev',
	nextButtonText: 'Next',
	mainActionButtonText: 'Find A Store',
	showDetailsText: 'show details',
	hideDetailsText: 'hide details',

	el: null,
	prevButton: null,
	nextButton: null,
	container: null,
	controls: null,
	actionButton: null,
	activeSlide: null,

	currentSlideIndex: 0,
	collapsedDescriptionHeight: 0,
	lockControlsClicks: false,

	init: function(options) {
		options = options || {};

		// *** Получаем опции ***
		var el = options.el || '',
			elId = options.elId || '',
			dataUrl = options.dataUrl || '';

		// *** Проверка обязательных параметров ***
		if ((!el && !elId) || !dataUrl) {
			console.error('Не все параметры переданны в конструктор!');
			return;
		}

		this.animationMilliseconds = options.animationMilliseconds || this.animationMilliseconds;
		this.prevButtonText = options.prevButtonText || this.prevButtonText;
		this.nextButtonText = options.nextButtonText || this.nextButtonText;
		this.mainActionButtonText = options.mainActionButtonText || this.mainActionButtonText;
		this.showDetailsText = options.showDetailsText || this.showDetailsText;
		this.hideDetailsText = options.hideDetailsText || this.hideDetailsText;

		this.el = el || document.getElementById(elId);

		this.render();

		this.loadData(dataUrl, (function(xhr) {
			if (xhr.status === 200) {
				this.data = JSON.parse(xhr.responseText);
				this.renderSliders();
				this.controls.style.display = 'block';
			} else {
				this.error('Error loading data... ;(');
			}
		}).bind(this));
	},
	loadData: function(url, onLoadCallback) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.setRequestHeader('Content-Type', 'application/json');

		xhr.onload = function() {
			onLoadCallback(xhr);
		};

		xhr.send();

	},

	render: function() {
		this.el.classList.add('info-box');

		this.el.innerHTML = '' +
			'<div class="container">' +
				'<p class="error"></p>' +
				'	<div class="slides"></div>' +

				'<div class="controls">' +
					'<p class="toggle-details">' +
						'<a href="javascript: void 0;" class="show-details">' + this.showDetailsText + '</a>' +
						'<a href="javascript: void 0;" class="hide-details">' + this.hideDetailsText + '</a>' +
					'</p>' +

					'<a href="javascript: void 0;" class="button button-left btn-prev">' +
						'<span class="icon">' +
							'<img src="./src/img/btn_ic_gray_left.png" class="normal" alt=""/>' +
							'<img src="./src/img/btn_ic_brn_left.png" class="active" alt=""/>' +
						'</span>' +
						'<span class="content">' + this.prevButtonText + '</span>' +
					'</a>' +

					'<a href="javascript: void 0;" class="button button-right btn-next">' +
						'<span class="content">' + this.nextButtonText + '</span>' +
						'<span class="icon">' +
							'<img src="./src/img/btn_ic_gray_right.png" class="normal" alt=""/>' +
							'<img src="./src/img/btn_ic_brn_right.png" class="active" alt=""/>' +
						'</span>' +
					'</a>' +

					'<a href="#" target="_blank" class="button button-right main-action-button">' +
						'<span class="content">' + this.mainActionButtonText + '</span>' +
						'<span class="icon">&#9658;</span>' +
					'</a>' +
				'</div>' +
			'</div>'
		;

		this.prevButton = this.el.getElementsByClassName('btn-prev')[0];
		this.nextButton = this.el.getElementsByClassName('btn-next')[0];

		this.prevButton.addEventListener('click', (function() {
			this.prevSlide();
		}).bind(this));
		this.nextButton.addEventListener('click', (function() {
			this.nextSlide();
		}).bind(this));

		this.container = this.el.getElementsByClassName('container')[0];
		this.controls = this.container.getElementsByClassName('controls')[0];

		this.controls.style.display = 'none';

		this.actionButton = this.controls.getElementsByClassName('main-action-button')[0];

		this.controls.getElementsByClassName('show-details')[0].addEventListener('click', (function() {
			!this.lockControlsClicks && this.showDetails();
		}).bind(this));
		this.controls.getElementsByClassName('hide-details')[0].addEventListener('click', (function() {
			!this.lockControlsClicks && this.hideDetails();
		}).bind(this));
	},
	renderSliders: function() {

		var slidesNode = this.el.getElementsByClassName('slides')[0];

		for (var i = 0; i < this.data.length; i++) {
			var product = this.data[i];

			var slideNode = document.createElement('div');
			slideNode.classList.add('slide');
			slideNode.style.transition = this.animationMilliseconds / 2 + 'ms';


			slideNode.innerHTML =
				'<div class="image">' +
					'<img src="./src/img/' + product.img + '" alt="' + product.title + '" />' +
				'</div>' +

				'<div class="content">' +
					'<h3>' + product.title + '</h3>' +

					'<div class="body">' +
						'<p class="description">' + product.description + '</p>' +
						'<p class="note">' + product.note + '</p>' +
					'</div>' +
				'</div>'
			;

			slidesNode.appendChild(slideNode);
		}

		this.goToSlide(this.currentSlideIndex);
	},

	error: function(text) {
		var errorNode = this.el.getElementsByClassName('error')[0];
		errorNode.style.display = 'table';
		errorNode.innerHTML = text;
	},

	prevSlide: function() {
		this.goToSlide((this.currentSlideIndex == 0) ? this.data.length - 1 : this.currentSlideIndex - 1);
	},
	nextSlide: function() {
		this.goToSlide((this.currentSlideIndex + 1 >= this.data.length) ? 0 : this.currentSlideIndex + 1);
	},
	goToSlide: function(index) {
		if (this.lockControlsClicks) {
			return;
		}

		this.lockControlsClicks = true;

		if (this.el.classList.contains('full-details')) {
			this.hideDetails();
		}

		var nextSlideNode = this.container.getElementsByClassName('slide')[index];

		// *** Функция активации слайда ***
		var activateSlide = (function(slide) {
			slide.classList.add('active');

			setTimeout((function() {
				this.lockControlsClicks = false;
			}).bind(this), this.activeSlide ? this.animationMilliseconds / 2 : 0);
		}).bind(this);
		// ************************************

		if (this.activeSlide) {
			this.activeSlide.classList.remove('active');

			setTimeout(activateSlide, (this.animationMilliseconds / 2), nextSlideNode);
		} else {
			activateSlide(nextSlideNode);
		}


		this.currentSlideIndex = index;
		this.activeSlide = nextSlideNode;

		this.actionButton.setAttribute('href', '#' + this.data[this.currentSlideIndex]['productUrl']);
	},

	showDetails: function() {
		this.lockControlsClicks = true;

		var contentNode = this.activeSlide.getElementsByClassName('content')[0],
			imageBlockNode = this.activeSlide.getElementsByClassName('image')[0],
			bodyNode = this.activeSlide.getElementsByClassName('body')[0],
			noteNode = contentNode.getElementsByClassName('note')[0];

		contentNode.style.transition = this.animationMilliseconds + 'ms';
		imageBlockNode.style.transition = this.animationMilliseconds + 'ms';

		imageBlockNode.classList.add('fade-out');

		contentNode.style.marginTop = -(imageBlockNode.offsetHeight - 15) + 'px';

		// дожидаемся окончания анимации (пропадает картинка + текст подтягивается наверх)
		setTimeout((function() {
			this.collapsedDescriptionHeight = bodyNode.offsetHeight;

			var maxBodyHeight = this.controls.offsetTop - bodyNode.offsetTop;
			bodyNode.style.height = maxBodyHeight + 'px';

			noteNode.style.display = 'block';
			var noteHeight = noteNode.offsetHeight;

			noteNode.style.height = '0';
			noteNode.style.overflow = 'hidden';

			// хак чтоб применились стили для noteNode
			setTimeout((function() {
				noteNode.style.transition = this.animationMilliseconds + 'ms';
				noteNode.style.height = noteHeight + 'px';

				this.el.classList.add('full-details');

				// дожидаемся полного раскрытия блока noteNode
				setTimeout((function() {
					if (bodyNode.scrollHeight > maxBodyHeight) {
						bodyNode.classList.add('scroll-box');
					}

					this.lockControlsClicks = false;
				}).bind(this), this.animationMilliseconds);
			}).bind(this), 50);
		}).bind(this), this.animationMilliseconds);
	},
	hideDetails: function() {
		this.lockControlsClicks = true;

		var contentNode = this.activeSlide.getElementsByClassName('content')[0],
			imageBlockNode = this.activeSlide.getElementsByClassName('image')[0],
			bodyNode = this.activeSlide.getElementsByClassName('body')[0],
			noteNode = contentNode.getElementsByClassName('note')[0];


		noteNode.style.transition = '0ms';
		noteNode.style.display = 'none';

		bodyNode.classList.remove('scroll-box');
		bodyNode.style.height = this.collapsedDescriptionHeight + 'px';

		contentNode.style.marginTop = '0';

		// дожидаемся пока блок с текстом contentNode займет свое место
		// затем показываем картинку
		setTimeout((function(image) {
			image.classList.remove('fade-out');

			this.el.classList.remove('full-details');
			this.lockControlsClicks = false;
		}).bind(this), this.animationMilliseconds, imageBlockNode);
	}
});