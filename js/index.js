let APP = {}
let $document = $(document)

APP.utils = {
    debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
            const context = this;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    },
    createModalWindow: (modalSelector, btnOpenSelector, btnCloseSelector, callBack, additionBnts) => {
        const $modal = $(modalSelector)
        const $modalContent = $(`${modalSelector}__content`)
        const $openBtn = $(btnOpenSelector)
        const $closeBtn = $(btnCloseSelector)

        const openModal = () => {
            $modal.fadeIn(400)
            $openBtn.addClass('active')
            $('body').addClass('no-scroll')
        }

        const closeModal = () => {
            $modal.fadeOut(400)
            $openBtn.removeClass('active')
            $('body').removeClass('no-scroll')
        }

        const modalHandler = () => {
            if ($openBtn.hasClass('active')) {
                closeModal()
            } else {
                openModal()
            }
            if (typeof callBack === 'function') {
                callBack()
            }
        }

        $modal.hide()
        $openBtn.on('click', modalHandler)
        $closeBtn.on('click', closeModal)

        const INTERACTIVE_ELEMENTS = `${modalSelector}__content, ${btnOpenSelector}, ${additionBnts}`
        $(document).on('click', (e) => {
            if (!$(e.target).closest(INTERACTIVE_ELEMENTS).length) {
                closeModal()
            }
        })
    }
}


APP.header = {
    links: () => {
        const $header = $('header')
        const $links = $header.find('nav button.button')
        const $dropdownLinks = $header.find('.header__dropdown_links')
        const $containers = $dropdownLinks.find('.header__dropdown_links__container')
        let isOpen = false
        const speed = 600
        const closeSpeed = 300

        const closeMenu = () => {
            $links.removeClass('active')
            $dropdownLinks.slideUp(closeSpeed)
            isOpen = false
            $('.header').removeClass('openMenu')
        }

        const closeAllMenu = () => {
            closeMenu()
            $('.header').removeClass('openMenu')
        }

        const openMenu = (link) => {
            const open = () => {
                $('.header').addClass('openMenu')
                isOpen = true
                $(link).addClass('active')
                const data = $(link).data('target-menu')
                const $targetMenu = $header.find(`.header__dropdown_links[data-menu=${data}]`)
                $targetMenu.slideDown(speed)
            }

            closeAllMenu()
            open()
        }

        const handler = (link) => {
            if ($(link).hasClass('active')) {
                closeMenu()
                return
            }
            openMenu(link)
        }

        $links.each(function (id, link) {
            $(link).click(function (e) {
                e.stopPropagation()
                handler(link)
            })
        })

        $(document).on('click', function (e) {
            if (!$(e.target).closest($links).length && !$(e.target).closest($containers).length) {
                if (isOpen) {
                    closeAllMenu()
                }
            }
        })

        $containers.on('click', function (e) {
            e.stopPropagation()
        })
    },
    setDropdownEqHeight: () => {


        const setHeight = () => {
            let maxHeight = Math.max(...$('.header__dropdown_links').map((_, el) => $(el).outerHeight()).get())
            $('.header__dropdown_links').height(maxHeight)
        }


        setHeight()
        const handleResize = APP.utils.debounce(setHeight, 300);
        window.addEventListener('resize', handleResize);

    },

    linksMobileMenu: () => {

        // $('.header .mobile').click(function () {
        //     $(this).toggleClass('active')
        // })

    },

    scrolledEffect: () => {
        const $header = $('header');

        // Обробник скролу для сторінки
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > 0) {
                $header.addClass('scrolled');
            } else {
                $header.removeClass('scrolled');
            }
        });

    },

}

APP.site = {
    heroSLider: () => {
        let heroSlider = new Swiper('.heroSlider', {
            slidesPerView: 1,
            spaceBetween: 8,
            loop: true,
            parallax: true,
            speed: 600,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                // pauseOnMouseEnter: true,
            },
            navigation: {
                prevEl: '.heroSlider .pagination-container .prev-mobile, .heroSlider .prev-desktop',
                nextEl: '.heroSlider .pagination-container .next-mobile, .heroSlider .next-desktop',
            },

            pagination: {
                el: '.hero-pagination .pagination',
                clickable: true,
                renderBullet: function (index, className) {
                    const slides = this.slides;
                    const title = slides[index].getAttribute('data-title');
                    console.log('create:',)
                    return `<div class="${className}" data-index="${index}"> <div class='text'>${title} </div><div class='bar'></div></div>`;
                }
            },
            on: {
                autoplayTimeLeft(s, time, progress) {
                    const paginationBullets = document.querySelectorAll('.hero-pagination .swiper-pagination-bullet');
                    const activeIndex = s.realIndex;
                    const activeBullet = paginationBullets[activeIndex];
                    const widthPercentage = (1 - progress) * 100
                    activeBullet.style.setProperty('--width', `${widthPercentage}%`);

                    paginationBullets.forEach((bullet, idx) => {
                        if (idx !== activeIndex) {
                            bullet.style.setProperty('--width', '0%');
                        }
                    });
                },
                init(s) {
                    // Add pause/resume on pagination hover
                    const pagination = document.querySelector('.hero-pagination');
                    pagination.addEventListener('mouseenter', () => {
                        s.autoplay.pause();
                    });
                    pagination.addEventListener('mouseleave', () => {
                        s.autoplay.resume();
                    });
                }
            },

        })
    },
    stickyMap: () => {
        const $column = $('.about-with-map__grid .col')
        const $textBlock = $column.find('.col-grid.with-text')
        const $itemsBlock = $column.find('.col-grid.with-items')
        const $itemsBlockFirstItem = $column.find('.col-grid.with-items .item').first()
        const $map = $column.find('.map')


        const calcMarginTop = () => {
            let mapHeigth = $map.innerHeight()
            let textBlockHeight = $textBlock.innerHeight()
            let itemsBlockHeight = $itemsBlock.innerHeight()
            let itemFirstHeight = $itemsBlockFirstItem.innerHeight()

            let marginTop = mapHeigth - textBlockHeight - itemFirstHeight + 11
            if (marginTop <= 56) {
                return 56
            }

            return marginTop
        }

        const calcMarginBottom = () => {
            let mapHeigth = $map.innerHeight()
            let itemsBlockHeight = $itemsBlock.innerHeight()
            let marginTop = mapHeigth - itemsBlockHeight
            return marginTop
        }

        const setOffset = () => {
            if (window.innerWidth <= 768) {
                $itemsBlock.css({
                    marginTop: '',
                    marginBottom: ''
                })
                return
            }

            $itemsBlock.css({
                marginTop: calcMarginTop(),
                marginBottom: calcMarginBottom()
            })
        }


        setOffset()
        const handleResize = APP.utils.debounce(setOffset, 300);
        window.addEventListener('resize', handleResize);

    },
    newsTabsSlider: () => {
        const tabs = document.querySelectorAll('.news-tabs__container__tab');
        const tabButtons = document.querySelectorAll('.news-tabs__controls button');
        const sliders = [];

        // Ініціалізація Swiper для кожного слайдера в кожному табі
        tabs.forEach((tab, index) => {
            const sliderContainer = tab.querySelector('.newsTabsSlider');
            if (sliderContainer) {
                const slider = new Swiper(sliderContainer, {
                    slidesPerView: 3,
                    spaceBetween: 16,
                    speed: 600,
                    pagination: {
                        el: `.tab-${index} .pagination`,
                        clickable: true,
                    },
                    navigation: {
                        prevEl: `.tab-${index} .news-tab-pagination-prev`,
                        nextEl: `.tab-${index} .news-tab-pagination-next`,
                    },
                    autoplay: {
                        delay: 4000,
                        disableOnInteraction: false,
                    },
                    breakpoints: {
                        0: {
                            slidesPerView: 'auto',
                            slidesOffsetAfter: 16,
                            slidesOffsetBefore: 16,
                            loop: true,
                        },
                        730: {
                            slidesPerView: 'auto',
                            slidesOffsetAfter: 16,
                            slidesOffsetBefore: 16,
                            loop: false,
                        },
                        1067: {
                            slidesOffsetAfter: 0,
                            slidesOffsetBefore: 0,
                            slidesPerView: 3,
                            loop: false,
                        },
                    },
                    on: {
                        autoplayTimeLeft(s, time, progress) {
                            const paginationBullets = tab.querySelectorAll('.pagination .swiper-pagination-bullet');
                            if (paginationBullets.length === 0) return;
                            const activeIndex = s.realIndex;
                            const activeBullet = paginationBullets[activeIndex];
                            const widthPercentage = (1 - progress) * 100;
                            activeBullet.style.setProperty('--width', `${widthPercentage}%`);

                            paginationBullets.forEach((bullet, idx) => {
                                if (idx !== activeIndex) {
                                    bullet.style.setProperty('--width', '0%');
                                }
                            });
                        },
                        init() {
                            togglePagination(this);
                        },
                        resize() {
                            togglePagination(this);
                        },
                    },
                });

                sliders.push(slider);

                // Функція для керування відображенням пагінації
                function togglePagination(swiper) {
                    const pagination = tab.querySelector('.news-tab-pagination');
                    console.log(':', window.innerWidth > 768)
                    if (!swiper.isLocked && window.innerWidth <= 768) {
                        pagination.style.display = 'flex';
                    } else {
                        pagination.style.display = 'none';
                    }
                }
            }
        });


        const switchTab = (index) => {
            // Оновлення активної кнопки
            tabButtons.forEach((btn, btnIndex) => {
                btn.classList.toggle('active', btnIndex === index);
            });

            // Оновлення відображення табів
            tabs.forEach((tab, tabIndex) => {
                tab.style.display = tabIndex === index ? 'block' : 'none';
            });

            // Оновлення активного слайдера
            if (sliders[index]) {
                sliders[index].slideTo(0, 0); // Скидаємо до першого слайда без анімації
                sliders[index].update();
            }
        };

        // Додаємо обробники подій для кнопок
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                switchTab(index);
            });
        });

        // Ініціалізація: показати перший активний таб
        const initialActiveButton = Array.from(tabButtons).findIndex(btn => btn.classList.contains('active'));
        switchTab(initialActiveButton !== -1 ? initialActiveButton : 0);

        // Додаємо обробник зміни розміру вікна
        const handleResize = APP.utils.debounce(() => {
            sliders.forEach(slider => slider.update());
        }, 300);
        window.addEventListener('resize', handleResize);


    },
    parthersSldier: () => {
        let partnersSliderIndex = new Swiper('.partnersSliderIndex', {
            spaceBetween: -1,
            speed: 600,
            pagination: {
                el: '.partnersSliderIndex-pagination .pagination',
                clickable: true,
            },
            navigation: {
                prevEl: '.partnersSliderIndex-pagination-prev',
                nextEl: '.partnersSliderIndex-pagination-next',
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                // pauseOnMouseEnter: true,
            },
            breakpoints: {
                0: {
                    slidesPerView: 'auto',
                    slidesOffsetBefore: 16,
                    slidesOffsetAfter: 16,
                },
                1024: {
                    slidesPerView: 4,
                    slidesOffsetBefore: 16,
                    slidesOffsetAfter: 16,
                },
                1633: {
                    slidesPerView: 4,
                    slidesOffsetBefore: 0,
                    slidesOffsetAfter: 0,
                }
            },
            on: {
                autoplayTimeLeft(s, time, progress) {
                    const paginationBullets = document.querySelectorAll('.partnersSliderIndex-pagination .pagination .swiper-pagination-bullet');
                    if (paginationBullets.length === 0) return;
                    const activeIndex = s.realIndex;
                    const activeBullet = paginationBullets[activeIndex];
                    if(!activeBullet){
                        return
                    }

                    const widthPercentage = (1 - progress) * 100
                    activeBullet.style.setProperty('--width', `${widthPercentage}%`);

                    paginationBullets.forEach((bullet, idx) => {
                        if (idx !== activeIndex) {
                            bullet.style.setProperty('--width', '0%');
                        }
                    });
                },
            },
        })

        const togglePagination = () => {
            if (!!partnersSliderIndex) {
                return
            }
            if (partnersSliderIndex.isLocked) {
                $('.partnersSliderIndex-pagination').hide()
            } else {
                $('.partnersSliderIndex-pagination').show()
            }
        }
        togglePagination()
        const handleResize = APP.utils.debounce(togglePagination, 300);

        window.addEventListener('resize', handleResize);
    },
    footerDropDowns: () => {
        const $footer = $('.footer')
        const $blocks = $footer.find('.footer__container__links .col__add_grid .column .block')

        const initDropdowns = () => {
            $blocks.each(function (id, block) {
                $(block).find('.block__body').hide()
                $(block).find('.block__header').click(function () {
                    $(this).toggleClass('active')
                    $(this).siblings('.block__body').slideToggle(600)
                })
            })
        }

        const destroyDropdowns = () => {
            $blocks.each(function (id, block) {
                $(block).find('.block__body').show()
                $(block).find('.block__header').removeClass('active')
            })
        }

        const checkSize = () => {
            if (window.innerWidth <= 768) {
                initDropdowns()
            } else {
                destroyDropdowns()
            }
        }

        checkSize()
        const handleResize = APP.utils.debounce(checkSize, 300);
        window.addEventListener('resize', handleResize);
    }

}

APP.modals = {
    menuLinks: () => {
        const $mobileMenu = $('.modal.mobile-menu')
        // modal config

        const calcHeight = () => {
            const $header = $('.header')
            $mobileMenu.css({
                height: window.innerHeight - $header.innerHeight(),
                top: $header.innerHeight()
            })
        }

        const callBack = () => {
            $('.header').toggleClass('openMenu')
        }

        const createModalWindow = (modalSelector, btnOpenSelector, btnCloseSelector, callBack, additionBnts) => {
            const $modal = $(modalSelector)
            const $modalContent = $(`${modalSelector}__content`)
            const $openBtn = $(btnOpenSelector)
            const $closeBtn = $(btnCloseSelector)

            const openModal = () => {
                $modal.fadeIn(400)
                $openBtn.addClass('active')
                $('body').addClass('no-scroll')
                calcHeight()
            }

            const closeModal = () => {
                // Якщо слайд відкритий, спочатку закриваємо його
                if ($targetSlide && $targetSlide.is(':visible')) {
                    closeSlide()
                }
                $modal.fadeOut(400)
                $openBtn.removeClass('active')
                $('body').removeClass('no-scroll')
            }

            const modalHandler = () => {
                if ($openBtn.hasClass('active')) {
                    closeModal()
                } else {
                    openModal()
                }
                if (typeof callBack === 'function') {
                    callBack()
                }
            }

            $modal.hide()
            $openBtn.on('click', modalHandler)
            $closeBtn.on('click', closeModal)

            const INTERACTIVE_ELEMENTS = `${modalSelector}__content, ${btnOpenSelector}, ${additionBnts}`
            $(document).on('click', (e) => {
                if (!$(e.target).closest(INTERACTIVE_ELEMENTS).length) {
                    // Якщо слайд відкритий, закриваємо його
                    if ($targetSlide && $targetSlide.is(':visible')) {
                        closeSlide()
                    } else {
                        // Інакше закриваємо модалку
                        closeModal()
                    }
                }
            })
        }

        // change slide
        const $modal = $('.modal.mobile-menu .mobile-menu__content')
        const $block = $modal.find('.block')
        const $btn = $block.find('button')
        let $targetSlide = null

        const changeSlide = (that) => {
            const data = $(that).data('target')
            $targetSlide = $modal.find(`.link-block[data-menu='${data}'`)

            $targetSlide.show()
            setTimeout(() => {
                $targetSlide.css({
                    transform: `translateX(0)`
                }, 1)
                $('.header .logo__container').addClass('change')
            })

            setTimeout(() => {
                $block.hide()
                $targetSlide.css({
                    position: 'relative',
                    top: ''
                })
            }, 400)
        }

        $btn.click(function () {
            let that = this
            changeSlide(that)
        })

        const closeSlide = () => {
            $('.header .logo__container').removeClass('change')
            $block.show()
            $targetSlide.css({
                position: '',
                top: '',
                transform: ''
            })

            setTimeout(() => {
                $targetSlide.hide()
            }, 401)
        }

        $('#goToBackInLinksMenu').click(closeSlide)

        createModalWindow('.mobile-menu', '#toggleMobileMenu', '', callBack, '#goToBackInLinksMenu')
        
        calcHeight()
        const handleResize = APP.utils.debounce(calcHeight, 100);

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        } else {
            // Запасний варіант для старих браузерів
            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', handleResize);
        }
        window.addEventListener('resize', handleResize);
    },
    changeMenuSLide: () => {



    }
}

$document.ready(function () {
    // APP.utils.createModalWindow('selector', 'openBtn', 'closeBtn')

    APP.header.links()
    APP.header.setDropdownEqHeight()
    APP.header.linksMobileMenu()
    APP.header.scrolledEffect()

    APP.modals.menuLinks()
    APP.modals.changeMenuSLide()

    APP.site.heroSLider()
    APP.site.stickyMap()
    APP.site.newsTabsSlider()
    APP.site.parthersSldier()
    APP.site.footerDropDowns()

})