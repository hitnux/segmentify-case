
class Segment {
    constructor(options) {
        this.urls = {
            templates: '/segment/template.html'
        }
        this.config = {
            target: 'body',
            ...options
        }
        this.init();
    }

    init = async () => {
        this.createApp();
        await this.fetchData();
        this.updateTab();
        this.createSlider();
        this.onTabChange();
        this.closeModal();
    }

    onTabChange = () => {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const rect = tab.getBoundingClientRect();
                document.querySelector('.tab.active').classList.remove('active');
                tab.classList.add('active');
                this.slider.destroy();
                this.updateTab();
                this.createSlider();
                document.querySelector('.tabs').scrollLeft = rect.left;
            });
        });
    }

    createApp = () => {
        const app =
            `<section id="segment" class="segment-container">
                <div class="segment-title">Sizin için Seçtiklerimiz</div>
                <div class="segment-wrapper">
                    <ul class="segment-sidebar tabs">
                    </ul>
                    <div class="segment-content">
                        <div class="swiper">
                            <div class="swiper-wrapper tab-content"></div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                    </div>
                </div>
                <div class="modal hide">
                    <div class="icon-ok-circled"></div>
                    <div class="modal-body">
                        <div class="message">Ürün Sepete Eklendi</div>
                        <div class="btn">Sepete Git</div>
                    </div>
                    <div class="close icon-cancel"></div>
                </div>
                <div class="templates"></div>
            </section>`;
        document.querySelector(this.config.target).innerHTML += app;
        this.element = document.querySelector('#segment');
    }

    createSlider = () => {
        this.slider = new Swiper('.swiper', {
            slidesPerView: 'auto',
            spaceBetween: 8,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            preloadImages: false,
            lazy: true,
            watchSlidesProgress: true
        });
    }

    updateTab = () => {
        const tab = this.element.querySelector('.tab.active');

        if (tab) {
            this.element.querySelector('.tab-content').innerHTML = document.querySelector(`[data-content="${tab.getAttribute('data-tab')}"]`).innerHTML;
            this.addToCart();
        }
    }

    addToCart = () => {
        document.querySelectorAll('.product__action').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = document.querySelector('.modal');
                modal.classList.remove('hide');

                setTimeout(() => {
                    modal.classList.add('hide');
                }, 3000)
            });
        });
    }

    closeModal = () => {
        document.querySelector('.modal .close').addEventListener('click', (e) => {
            e.target.parentNode.classList.add('hide');
        });
    }

    createCategories = (categories) => {
        categories.forEach(category => {
            const titleArr = category.split(' > ');
            const title = titleArr[titleArr.length - 1];
            this.element.querySelector('.tabs').innerHTML += `<li class="tab${categories[0] == category ? ' active' : ''}" data-tab="${title}"><div>${title}</div></li>`;
        });
    }

    createProducts = (response) => {
        Object.entries(response).forEach((data) => {
            const categoryTitleArr = data[0].split(' > ');
            const category = categoryTitleArr[categoryTitleArr.length - 1];
            const template = document.createElement('template');

            template.setAttribute('data-content', category);

            data[1].forEach((product, ind) => {
                template.innerHTML +=
                    `<div class="swiper-slide product tab-content ${ind == 0 ? 'active' : ''}">
                        <img data-src="${product.image}" class="product__image swiper-lazy"/>
                        <div class="swiper-lazy-preloader"></div>
                        <div class="product__title">${product.name}</div>
                        <div class="product__price">${product.price.toFixed(2)} TL</div>
                        ${product.params.shippingFee === 'FREE' ? '<div class="product__info">Ücretsiz Kargo</div>' : ''}
                        <button class="product__action" data-product="${product.productId}">Sepete Ekle</button>
                    </div>`;
            });

            document.querySelector('#segment .templates').appendChild(template);
        });
    }

    fetchData = async () => {
        await fetch('./data/product-list.json')
            .then((response) => response.json())
            .then((data) => {
                const res = data.responses[0][0].params;

                this.createCategories(res.userCategories);
                this.createProducts(res.recommendedProducts);
            })
            .catch((error) => {
                console.error('Segment Error:', error);
            });
    }
}

new Segment({
    target: 'main'
});