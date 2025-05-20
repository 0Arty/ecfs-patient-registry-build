const APP = {}
const $document = $(document)

APP.utils = {
    debounce: (func, delay) => {
        let timeoutId
        return function (...args) {
            const context = this
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                func.apply(context, args)
            }, delay)
        }
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
                if ($openBtn.hasClass('active')) {
                    closeModal()
                }
            }
        })
    }
}

class CustomSwiperSlider extends Swiper {
    constructor(containerSelector, options = {}) {
        const defaultOptions = {
            speed: 600,
            pagination: {
                el: `${containerSelector}-pagination .pagination`,
                clickable: true,
            },
            navigation: {
                prevEl: `${containerSelector}-pagination-prev`,
                nextEl: `${containerSelector}-pagination-next`,
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                // pauseOnMouseEnter: true, // За потреби можна увімкнути
            },
            on: {
                autoplayTimeLeft(s, time, progress) {
                    const paginationBullets = document.querySelectorAll(
                        `${containerSelector}-pagination .pagination .swiper-pagination-bullet`
                    )
                    if (paginationBullets.length === 0) return
                    const activeIndex = s.realIndex
                    const activeBullet = paginationBullets[activeIndex]
                    if (!activeBullet) return

                    const widthPercentage = (1 - progress) * 100
                    activeBullet.style.setProperty('--width', `${widthPercentage}%`)

                    paginationBullets.forEach((bullet, idx) => {
                        if (idx !== activeIndex) {
                            bullet.style.setProperty('--width', '0%')
                        }
                    })
                },
                init(s) {
                    s.togglePagination()
                },
                resize(s) {
                    s.debouncedTogglePagination()
                },
                lock(s) {
                    s.togglePagination()
                },
                unlock(s) {
                    s.togglePagination()
                },
            },
            ...options,
        }
        super(containerSelector, defaultOptions)

        this.togglePagination = this.togglePagination.bind(this)
        this.debouncedTogglePagination = APP.utils.debounce(this.togglePagination, 300)
    }
    togglePagination() {
        if (!this.pagination.el) {
            return
        }
        if (this.isLocked) {
            $(this.pagination.el).hide()
        } else {
            $(this.pagination.el).show()
        }
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
        const handleResize = APP.utils.debounce(setHeight, 300)
        window.addEventListener('resize', handleResize)

    },

    linksMobileMenu: () => {

        // $('.header .mobile').click(function () {
        //     $(this).toggleClass('active')
        // })

    },

    scrolledEffect: () => {
        const $header = $('header')

        // Обробник скролу для сторінки
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > 0) {
                $header.addClass('scrolled')
            } else {
                $header.removeClass('scrolled')
            }
        })

    },

}

APP.footer = {
    dropdown: () => {
        $('.footer__usefull-info__drop').click(function () {
            $(this).toggleClass('active')
            $(this).siblings('.dropdown').slideToggle(400)
        })
    }
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
                    const slides = this.slides
                    const title = slides[index].getAttribute('data-title')
                    return `<div class="${className}" data-index="${index}"> <div class='text'>${title} </div><div class='bar'></div></div>`
                }
            },
            on: {
                autoplayTimeLeft(s, time, progress) {
                    const paginationBullets = document.querySelectorAll('.hero-pagination .swiper-pagination-bullet')
                    const activeIndex = s.realIndex
                    const activeBullet = paginationBullets[activeIndex]
                    const widthPercentage = (1 - progress) * 100
                    activeBullet.style.setProperty('--width', `${widthPercentage}%`)

                    paginationBullets.forEach((bullet, idx) => {
                        if (idx !== activeIndex) {
                            bullet.style.setProperty('--width', '0%')
                        }
                    })
                },
                init(s) {
                    // Add pause/resume on pagination hover
                    const pagination = document.querySelector('.hero-pagination')
                    pagination.addEventListener('mouseenter', () => {
                        s.autoplay.pause()
                    })
                    pagination.addEventListener('mouseleave', () => {
                        s.autoplay.resume()
                    })
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
        const handleResize = APP.utils.debounce(setOffset, 300)
        window.addEventListener('resize', handleResize)

    },
    newsTabsSlider: () => {
        const tabs = document.querySelectorAll('.news-tabs__container__tab')
        const tabButtons = document.querySelectorAll('.news-tabs__controls button')
        const sliders = []

        // Ініціалізація Swiper для кожного слайдера в кожному табі
        tabs.forEach((tab, index) => {
            const sliderContainer = tab.querySelector('.newsTabsSlider')
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
                            const paginationBullets = tab.querySelectorAll('.pagination .swiper-pagination-bullet')
                            if (paginationBullets.length === 0) return
                            const activeIndex = s.realIndex
                            const activeBullet = paginationBullets[activeIndex]
                            const widthPercentage = (1 - progress) * 100
                            activeBullet.style.setProperty('--width', `${widthPercentage}%`)

                            paginationBullets.forEach((bullet, idx) => {
                                if (idx !== activeIndex) {
                                    bullet.style.setProperty('--width', '0%')
                                }
                            })
                        },
                        init() {
                            togglePagination(this)
                        },
                        resize() {
                            togglePagination(this)
                        },
                    },
                })

                sliders.push(slider)

                // Функція для керування відображенням пагінації
                function togglePagination(swiper) {
                    const pagination = tab.querySelector('.news-tab-pagination')
                    if (!swiper.isLocked && window.innerWidth <= 768) {
                        pagination.style.display = 'flex'
                    } else {
                        pagination.style.display = 'none'
                    }
                }
            }
        })


        const switchTab = (index) => {
            // Оновлення активної кнопки
            tabButtons.forEach((btn, btnIndex) => {
                btn.classList.toggle('active', btnIndex === index)
            })

            // Оновлення відображення табів
            tabs.forEach((tab, tabIndex) => {
                tab.style.display = tabIndex === index ? 'block' : 'none'
            })

            // Оновлення активного слайдера
            if (sliders[index]) {
                sliders[index].slideTo(0, 0) // Скидаємо до першого слайда без анімації
                sliders[index].update()
            }
        }

        // Додаємо обробники подій для кнопок
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                switchTab(index)
            })
        })

        // Ініціалізація: показати перший активний таб
        const initialActiveButton = Array.from(tabButtons).findIndex(btn => btn.classList.contains('active'))
        switchTab(initialActiveButton !== -1 ? initialActiveButton : 0)

        // Додаємо обробник зміни розміру вікна
        const handleResize = APP.utils.debounce(() => {
            sliders.forEach(slider => slider.update())
        }, 300)
        window.addEventListener('resize', handleResize)


    },
    parthersSlider: () => {
        // let partnersSliderIndex = new Swiper('.partnersSliderIndex', {
        //     spaceBetween: -1,
        //     speed: 600,
        //     pagination: {
        //         el: '.partnersSliderIndex-pagination .pagination',
        //         clickable: true,
        //     },
        //     navigation: {
        //         prevEl: '.partnersSliderIndex-pagination-prev',
        //         nextEl: '.partnersSliderIndex-pagination-next',
        //     },
        //     autoplay: {
        //         delay: 4000,
        //         disableOnInteraction: false,
        //         // pauseOnMouseEnter: true,
        //     },
        //     breakpoints: {
        //         0: {
        //             slidesPerView: 'auto',
        //             slidesOffsetBefore: 16,
        //             slidesOffsetAfter: 16,
        //         },
        //         1024: {
        //             slidesPerView: 4,
        //             slidesOffsetBefore: 16,
        //             slidesOffsetAfter: 16,
        //         },
        //         1633: {
        //             slidesPerView: 4,
        //             slidesOffsetBefore: 0,
        //             slidesOffsetAfter: 0,
        //         }
        //     },
        //     on: {
        //         autoplayTimeLeft(s, time, progress) {
        //             const paginationBullets = document.querySelectorAll('.partnersSliderIndex-pagination .pagination .swiper-pagination-bullet')
        //             if (paginationBullets.length === 0) return
        //             const activeIndex = s.realIndex
        //             const activeBullet = paginationBullets[activeIndex]
        //             if (!activeBullet) {
        //                 return
        //             }

        //             const widthPercentage = (1 - progress) * 100
        //             activeBullet.style.setProperty('--width', `${widthPercentage}%`)

        //             paginationBullets.forEach((bullet, idx) => {
        //                 if (idx !== activeIndex) {
        //                     bullet.style.setProperty('--width', '0%')
        //                 }
        //             })
        //         },
        //     },
        // })

        const breakpoints = {
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
        }
        const options = {
            breakpoints,
            spaceBetween: -1,
        }

        const partnersSliderIndex = new CustomSwiperSlider('.partnersSliderIndex', options)

        // const togglePagination = () => {
        //     if (!!partnersSliderIndex) {
        //         return
        //     }
        //     if (partnersSliderIndex.isLocked) {
        //         $('.partnersSliderIndex-pagination').hide()
        //     } else {
        //         $('.partnersSliderIndex-pagination').show()
        //     }
        // }
        // togglePagination()
        // const handleResize = APP.utils.debounce(togglePagination, 300)

        // window.addEventListener('resize', handleResize)
    },
    footerDropDowns: () => {
        const $footer = $('.footer')
        const $blocks = $footer.find('.footer__container__links .col__add_grid .column .block')

        const initDropdowns = () => {
            $blocks.each(function (id, block) {
                $(block).find('.block__body').hide()
                $(block).find('.block__header').off('click').on('click', function () {
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
        const handleResize = APP.utils.debounce(checkSize, 300)
        window.addEventListener('resize', handleResize)
    },
    overscrollTopOffset: () => {
        const setHeight = () => {
            const navH = $('.page-navigation').innerHeight()
            const headerH = $('.header').innerHeight()
            const offset = headerH + navH

            $('html,body').css({
                scrollPaddingTop: offset
            })
        }

        setHeight()
        const handleResize = APP.utils.debounce(setHeight, 300)
        window.addEventListener('resize', handleResize)

    },
    participantsSetActiveLetter: () => {
        const $buttons = $('.container__for-mobile .col__for-btns button')
        const $grid = $('.container__for-mobile .grid')
        $buttons.click(function(){
            $buttons.removeClass('active')
            $(this).addClass('active')
            const data = $(this).data('click')

            console.log('data:', data)
            $($grid).find('.col').hide()
            $($grid).find(`.col[data-target='${data}']`).show()



            

        })
    }
}


APP.faq = {
    smallFaq: () => {
        $('.small-faq__container__faqs .faq').click(function () {
            $(this).toggleClass('active')
            $(this).find('.faq__body').slideToggle(700)
        })
    },
    faqPage: () => {
        const $itemTitle = $('.faq_page .faq__item__title')

        $itemTitle.click(function(){
            const $parrent = $(this).parent()
            $parrent.toggleClass('active')
            $parrent.find('.faq__item__body').slideToggle(700)
        })
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
                // $('body').addClass('no-scroll')
                calcHeight()
            }

            const closeModal = () => {
                // Якщо слайд відкритий, спочатку закриваємо його
                if ($targetSlide && $targetSlide.is(':visible')) {
                    closeSlide()
                }
                $modal.fadeOut(400)
                $openBtn.removeClass('active')
                // $('body').removeClass('no-scroll')
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
                        if ($openBtn.hasClass('active')) {
                            closeModal()
                        }
                        // Інакше закриваємо модалку
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
        const handleResize = APP.utils.debounce(calcHeight, 100)

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize)
        } else {
            // Запасний варіант для старих браузерів
            window.addEventListener('resize', handleResize)
            window.addEventListener('orientationchange', handleResize)
        }
        window.addEventListener('resize', handleResize)
    },
    changeMenuSLide: () => {



    }
}

APP.gsap = {
    init: () => {
        gsap.registerPlugin(ScrollTrigger)
    },
    pinPageNavigation: () => {
        let navTrigger

        function createNavTrigger() {
            if (navTrigger) navTrigger.kill()

            const header = document.querySelector('.header')
            const nav = document.querySelector('.complex__container .page-navigation')
            const title = document.querySelector('.complex__container .page-title')
            const footer = document.querySelector('.footer')

            if (!nav || !title) {
                return
            }

            const headerH = header.offsetHeight
            const navH = nav.offsetHeight
            const titleH = title.offsetHeight

            if (window.innerWidth > 769) {
                navTrigger = ScrollTrigger.create({
                    trigger: nav,
                    start: `top-=${headerH - 1}`,
                    endTrigger: footer,
                    end: `top-=${headerH + navH}`,
                    pin: true,
                    pinSpacing: false,
                    markers: false
                })
            } else {
                navTrigger = ScrollTrigger.create({
                    trigger: title,
                    start: `top-=${headerH}`,
                    endTrigger: footer,
                    end: `top-=${headerH + titleH}`,
                    pin: true,
                    pinSpacing: false,
                    markers: false
                })

                $('.links__mobile__container').css({
                    height: `${window.innerHeight - (headerH + titleH)}px`
                })
            }
        }

        createNavTrigger()
        const handleResize = APP.utils.debounce(createNavTrigger, 300)
        window.addEventListener('resize', handleResize)
    }
}

APP.map = {
    selectedLayer: null,
    defaultStyles: {
        color: '#FFFFFF',
        weight: 1,
        fillColor: '#09131514',
        fillOpacity: 1
    },

    highlightStyle: {
        color: '#FFFFFF',
        weight: 2,
        fillColor: '#87BCE7',
        fillOpacity: 1
    },
    hasDataStyle: {
        color: '#FFFFFF',
        weight: 2,
        fillColor: '#99D9E4',
        fillOpacity: 1
    },
    mapModal: async function (countryName) {
        const $mapDataContainer = $('.map__data_container');
        const $contentContainer = $('.map__data_container__body .content');
        const $simpleBar = $('[data-simplebar]');

        // Check if required elements exist
        if (!$mapDataContainer.length || !$contentContainer.length) {
            console.error('Required DOM elements not found');
            return;
        }

        // якщо блок вде є на екрані, тобто активний
        if ($mapDataContainer.hasClass('active')) {
            $mapDataContainer.removeClass('active');
            await new Promise(resolve => setTimeout(resolve, 400));
            $contentContainer.empty();
        }

        // Fetch countries data
        const countriesData = await APP.map.getActiveCountriesData();

        // Find country data
        const country = countriesData.find(c => c.name === countryName);

        if (country && country.data) {
            $('.map__data_container__heading .name').html(country.name)
            $('.map__data_container__heading .year').html(country.year)

            $.each(country.data, function (key, value) {
                const $itemDiv = $('<div>').addClass('item');
                const $keyDiv = $('<div>').addClass('key').text(key);
                const $valueDiv = $('<div>').addClass('value').text(value);

                $itemDiv.append($keyDiv, $valueDiv);
                $contentContainer.append($itemDiv);
            });

            if ($simpleBar.length && typeof SimpleBar !== 'undefined') {
                const simpleBarInstance = SimpleBar.instances.get($simpleBar[0]);
                if (simpleBarInstance) {
                    simpleBarInstance.recalculate();
                }
            }

            // Add active class
            $mapDataContainer.addClass('active');
        } else {
            console.error('Country data not found for:', countryName);
        }

        $('.map__data_container__heading button').click(function () {
            APP.map.mapModalClose()
        })


    },
    mapModalClose: function () {
        const $mapDataContainer = $('.map__data_container');
        const $contentContainer = $('.map__data_container__body .content');
        $mapDataContainer.removeClass('active');
        this.selectedLayer.setStyle(this.hasDataStyle);
        setTimeout(() => {
            $contentContainer.empty();
        }, 400)
    },
    getActiveCountriesData: async function () {
        const mapActiveCountries = '/js/data/mapCountriesData.json'
        try {
            const response = await fetch(mapActiveCountries)
            if (!response.ok) throw new Error('Failed to fetch countries data')
            return await response.json()
        } catch (error) {
            console.error('Error fetching countries data:', error)
            return []
        }
    },
    initMap: async function () {
        const activeCountries = await APP.map.getActiveCountriesData()
        const activeCountryNames = new Set(activeCountries.map(country => country.name))

        function isActiveCountry(name) {
            return activeCountryNames.has(name)
        }

        // GeoJSON URL
        const geoJSON = '/js/data/mapGeoJSON.json';

        // Fetch GeoJSON data once
        let geojson;
        try {
            const response = await fetch(geoJSON);
            if (!response.ok) throw new Error('Failed to fetch GeoJSON data');
            geojson = await response.json();
        } catch (error) {
            console.error('Error fetching GeoJSON data:', error);
            return;
        }

        document.querySelectorAll('.map__leaflet').forEach(mapContainer => {
            // Create a new map instance for each container
            const map = L.map(mapContainer, {
                renderer: L.canvas(),
                zoomControl: false,
                maxZoom: 6,
                minZoom: 3,
            }).setView([52, 19], 4);

            // Track the selected layer for this specific map
            // Add GeoJSON layer to the map
            L.geoJSON(geojson, {
                style: this.defaultStyles,
                renderer: L.canvas(),
                onEachFeature: function (feature, layer) {
                    const countryName = feature.properties.name;

                    // Apply style for active countries
                    if (isActiveCountry(countryName)) {
                        layer.setStyle(APP.map.hasDataStyle);
                        layer.isCanBeHandled = true;
                    }

                    // Add click event handler
                    layer.on({
                        click: function () {
                            if (!layer.isCanBeHandled) {
                                if (APP.map.selectedLayer) {
                                    APP.map.selectedLayer.setStyle(APP.map.hasDataStyle);
                                }
                                APP.map.mapModalClose()
                                APP.map.selectedLayer = null;
                                return;
                            }

                            if (APP.map.selectedLayer) {
                                APP.map.selectedLayer.setStyle(APP.map.hasDataStyle);
                            }

                            layer.setStyle(APP.map.highlightStyle);
                            APP.map.selectedLayer = layer;

                            APP.map.mapModal(countryName);
                        }
                    });
                }
            }).addTo(map);
            console.log('$(mapContainer):', $(mapContainer))

            const $parentNode = $(mapContainer).parent()

            $parentNode.find('.map-zoom-in').click(function () {
                map.zoomIn();
            })

            $parentNode.find('.map-zoom-out').click(function () {
                map.zoomOut();

            })
            $parentNode.find('.map-zoom-fullscreen').click(function () {

                setTimeout(() => {
                    map.invalidateSize();
                }, 50);


                if ($(this).hasClass('active')) {
                    $(this).removeClass('active')
                    $parentNode.removeClass('fixed')
                    $('header').removeClass('map-visible')
                    $('body').removeClass('no-scrollbar')

                } else {
                    $(this).addClass('active')
                    $parentNode.addClass('fixed')
                    $('header').addClass('map-visible')
                    $('body').addClass('no-scrollbar')

                }
            })
        });
    },
    documentTogglePointerEvents: () => {
        $('.map__container').click(function (e) {
            e.stopPropagation()
            $(this).addClass('active')
        });

        $(document).click(function (e) {
            if (!$(e.target).closest('.map__container').length) {
                $('.map__container').removeClass('active')
            }
        });
    }
}

APP.siteNavigation = () => {

    //links__mobile__container

    const $modal = $('.complex__container .links__mobile__container')
    const $modalDropdown = $('.complex__container .links__mobile__container__dropdown')
    const $modalContent = $('.complex__container .links__mobile__container__dropdown__content')
    const $openBtn = $('.complex__container .page-title')
    const $closeBtn = $('.complex__container .page-title')

    const openModal = () => {
        $modal.fadeIn(400)
        $modalDropdown.slideDown(400)
        $openBtn.addClass('active')
        // $('body').addClass('no-scroll')
    }

    const closeModal = () => {
        $modal.fadeOut(400)
        $modalDropdown.slideUp(400)
        $openBtn.removeClass('active')
        // $('body').removeClass('no-scroll')
    }

    const modalHandler = () => {
        if ($openBtn.hasClass('active')) {
            closeModal()
        } else {
            if (window.innerWidth <= 768) {
                openModal()
            }
        }
    }

    $modal.hide()
    $openBtn.on('click', modalHandler)

    const INTERACTIVE_ELEMENTS = `.complex__container .links__mobile__container__dropdown__content, .complex__container .page-title`
    $(document).on('click', (e) => {
        if (!$(e.target).closest(INTERACTIVE_ELEMENTS).length) {
            if ($openBtn.hasClass('active')) {
                closeModal()
            }
        }
    })

}

$document.ready(function () {
    APP.gsap.init()
    APP.gsap.pinPageNavigation()

    APP.header.links()
    APP.header.setDropdownEqHeight()
    APP.header.linksMobileMenu()
    APP.header.scrolledEffect()
    APP.footer.dropdown()


    APP.modals.menuLinks()
    APP.modals.changeMenuSLide()

    APP.site.heroSLider()
    APP.site.stickyMap()
    APP.site.newsTabsSlider()
    APP.site.parthersSlider()
    APP.site.footerDropDowns()
    APP.site.overscrollTopOffset()
    APP.site.participantsSetActiveLetter()

    APP.faq.smallFaq()
    APP.faq.faqPage()

    APP.map.initMap()
    APP.map.documentTogglePointerEvents()

    APP.siteNavigation()

})