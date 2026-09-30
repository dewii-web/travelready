/* ==========================================================================
   TRAVELREADY – Complete Application Logic & State Engine (v8)
   Features & Fixes:
   - Sticky Navbar, Mobile Menu & Scrollspy (with Optional Badges)
   - Unified `currentTrip` LocalStorage State Persistence across Refresh & Navigation
   - Dynamic Transport System (Kereta, Bus, Pesawat, Mobil) with Custom Labels, Placeholders, Prep Calculators & Flight Check-in Warnings
   - Explicit "Simpan & Lanjut" Action Buttons on Each Section (#packing, #dokumen, #transportasi, #budget)
   - Deep-Copy Snapshot Engine into `travelHistory` (NO Dummy Data, 100% Real User Input Recap)
   - Full Travel Recap Detail Modal (Checked Items Only, Documents, PDF Links, Transport Routes, Timeline, Budget Breakdown, Packing Tips)
   - Optional Feature: Plan Your Next Trip (`nextTripPlans`) Isolated Data
   - Scroll Reveal Animations & Custom Toast Notifications
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. STICKY NAVBAR, MOBILE MENU & SCROLLSPY
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        highlightActiveNav();
    });

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetSec = document.querySelector(targetId);
                if (targetSec) {
                    e.preventDefault();
                    targetSec.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    function highlightActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });

                bottomNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    /* ==========================================================================
       2. UNIFIED `currentTrip` STATE & DESTINATION CHECKLIST SYSTEM
       ========================================================================== */

    const defaultDestTemplates = {
        pantai: {
            name: "Pantai",
            icon: "🏖️",
            img: "assets/images/hero_suitcase.jpg",
            tip: "Gunakan waterproof pouch untuk melindungi HP dari air & pasir, serta terapkan metode gulung pakaian agar hemat ruang koper.",
            items: {
                short: [
                    { id: 101, name: "2-3 Kaos Santai / Dress Tipis", category: "pakaian", checked: false },
                    { id: 102, name: "1-2 Celana Pendek / Swimwear", category: "pakaian", checked: false },
                    { id: 103, name: "Baju Ganti & Pakaian Dalam", category: "pakaian", checked: false },
                    { id: 104, name: "Charger HP & Cable", category: "elektronik", checked: false },
                    { id: 105, name: "Powerbank", category: "elektronik", checked: false },
                    { id: 106, name: "Waterproof Phone Pouch", category: "elektronik", checked: false },
                    { id: 107, name: "Sunscreen (SPF 50+)", category: "toiletries", checked: false },
                    { id: 108, name: "Sabun & Shampo Travel Size", category: "toiletries", checked: false },
                    { id: 109, name: "Sikat Gigi & Pasta Gigi", category: "toiletries", checked: false },
                    { id: 110, name: "KTP / Paspor & Tiket", category: "dokumen", checked: false },
                    { id: 111, name: "Kacamata Hitam & Topi Pantai", category: "perlengkapan", checked: false },
                    { id: 112, name: "Sandal Flip-Flop & Handuk Microfiber", category: "perlengkapan", checked: false }
                ],
                medium: [
                    { id: 113, name: "5-6 Outfit Pantai & Swimwear", category: "pakaian", checked: false },
                    { id: 114, name: "3 Celana Pendek & Pakaian Malam", category: "pakaian", checked: false },
                    { id: 115, name: "Pakaian Dalam Lengkap & Baju Tidur", category: "pakaian", checked: false },
                    { id: 116, name: "Charger, Powerbank & Cable Kit", category: "elektronik", checked: false },
                    { id: 117, name: "Waterproof Case & Action Cam", category: "elektronik", checked: false },
                    { id: 118, name: "Sunscreen SPF 50+ & Aloe Vera Lotion", category: "toiletries", checked: false },
                    { id: 119, name: "Personal Toiletries Set", category: "toiletries", checked: false },
                    { id: 120, name: "KTP/Paspor, Tiket & Hotel Voucher", category: "dokumen", checked: false },
                    { id: 121, name: "Asuransi Perjalanan", category: "dokumen", checked: false },
                    { id: 122, name: "Kacamata, Topi Wide-Brim, Sandal", category: "perlengkapan", checked: false },
                    { id: 123, name: "Beach Tote Bag & Handuk Microfiber", category: "perlengkapan", checked: false },
                    { id: 124, name: "Dry Bag 10L", category: "perlengkapan", checked: false }
                ],
                long: [
                    { id: 125, name: "8+ Set Outfit Musim Panas & Swimwear", category: "pakaian", checked: false },
                    { id: 126, name: "4 Celana Pendek & Outer Linen", category: "pakaian", checked: false },
                    { id: 127, name: "Pakaian Dalam & Baju Tidur Cadangan", category: "pakaian", checked: false },
                    { id: 128, name: "Charger, Powerbank, Extra Battery", category: "elektronik", checked: false },
                    { id: 129, name: "Waterproof Case & Camera Kit", category: "elektronik", checked: false },
                    { id: 130, name: "Sunscreen Large & After-Sun Kit", category: "toiletries", checked: false },
                    { id: 131, name: "Toiletries & Skincare Full Set", category: "toiletries", checked: false },
                    { id: 132, name: "KTP/Paspor, Tiket PP, Hotel, Asuransi", category: "dokumen", checked: false },
                    { id: 133, name: "Kacamata Hitam, Topi, Sandal, Shoes", category: "perlengkapan", checked: false },
                    { id: 134, name: "Beach Bag, Sunbed Mat, Portable Fan", category: "perlengkapan", checked: false },
                    { id: 135, name: "Kantong Pakaian Basah Terpisah", category: "lainnya", checked: false }
                ]
            }
        },
        gunung: {
            name: "Gunung",
            icon: "⛰️",
            img: "assets/images/hero_suitcase.jpg",
            tip: "Bungkus pakaian dalam ziplock kedap air di dalam carrier, dan terapkan teknik layering pakaian (inner, insulating, outer).",
            items: {
                short: [
                    { id: 201, name: "Jaket Windbreaker / Thermal Layer", category: "pakaian", checked: false },
                    { id: 202, name: "2 Kaos Dry-Fit Trekking", category: "pakaian", checked: false },
                    { id: 203, name: "Celana Outdoor & Kaos Kaki Tebal", category: "pakaian", checked: false },
                    { id: 204, name: "Headlamp / Senter & Baterai Cadangan", category: "elektronik", checked: false },
                    { id: 205, name: "Powerbank High Capacity", category: "elektronik", checked: false },
                    { id: 206, name: "Tisu Basah & Tisu Kering", category: "toiletries", checked: false },
                    { id: 207, name: "Sabun Eco-friendly & Toothbrush", category: "toiletries", checked: false },
                    { id: 208, name: "Simaksi / Izin Pendakian & KTP", category: "dokumen", checked: false },
                    { id: 209, name: "Surat Keterangan Sehat Dokter", category: "dokumen", checked: false },
                    { id: 210, name: "Sepatu Trekking & Trekking Pole", category: "perlengkapan", checked: false },
                    { id: 211, name: "Jas Hujan / Ponco & Sarung Tangan", category: "perlengkapan", checked: false },
                    { id: 212, name: "Matras & Sleeping Bag", category: "perlengkapan", checked: false }
                ],
                medium: [
                    { id: 213, name: "2 Jaket Gunung (Waterproof & Fleece)", category: "pakaian", checked: false },
                    { id: 214, name: "4 Kaos Quick-Dry Trekking", category: "pakaian", checked: false },
                    { id: 215, name: "2 Celana Gunung & Inner Thermal", category: "pakaian", checked: false },
                    { id: 216, name: "Headlamp, Extra Battery & Powerbank 20k", category: "elektronik", checked: false },
                    { id: 217, name: "Navigasi GPS / Smartphone Offline Map", category: "elektronik", checked: false },
                    { id: 218, name: "Tisu Basah Biodegradable & Toiletries", category: "toiletries", checked: false },
                    { id: 219, name: "Sunscreen Outdoor & Lip Balm", category: "toiletries", checked: false },
                    { id: 220, name: "Simaksi, KTP, Surat Sehat, Peta Jalur", category: "dokumen", checked: false },
                    { id: 221, name: "Sepatu Gunung & Sandal Gunung", category: "perlengkapan", checked: false },
                    { id: 222, name: "Carrier Bag 50-60L & Rain Cover", category: "perlengkapan", checked: false },
                    { id: 223, name: "Tenda, Matras & Sleeping Bag Warm", category: "perlengkapan", checked: false },
                    { id: 224, name: "Kompor Camping, Nesting & P3K Kit", category: "perlengkapan", checked: false }
                ],
                long: [
                    { id: 225, name: "3 Jaket Layering (Base, Insulation, Shell)", category: "pakaian", checked: false },
                    { id: 226, name: "6+ Kaos Quick-Dry & Thermal Longjohns", category: "pakaian", checked: false },
                    { id: 227, name: "3 Celana Gunung & Extra Socks & Gloves", category: "pakaian", checked: false },
                    { id: 228, name: "Headlamp Pro, Solar Powerbank, GPS", category: "elektronik", checked: false },
                    { id: 229, name: "Outdoor Hygiene Kit & Sunscreen Large", category: "toiletries", checked: false },
                    { id: 230, name: "Simaksi, KTP, Surat Sehat, Asuransi Outdoor", category: "dokumen", checked: false },
                    { id: 231, name: "Sepatu Trekking Break-In, Gaiters, Pole", category: "perlengkapan", checked: false },
                    { id: 232, name: "Carrier 60L+, Tenda 4-Season, Sleeping Bag", category: "perlengkapan", checked: false },
                    { id: 233, name: "Multi-tool, Headlamp Baterai, P3K Complete", category: "perlengkapan", checked: false },
                    { id: 234, name: "Obat Ketinggian & Water Filter", category: "lainnya", checked: false }
                ]
            }
        },
        kota: {
            name: "Kota",
            icon: "🏙️",
            img: "assets/images/map_plane.jpg",
            tip: "Gunakan sneakers ternyaman untuk berjalan kaki jauh di perkotaan, dan sisakan 30% ruang koper untuk belanjaan / oleh-oleh.",
            items: {
                short: [
                    { id: 301, name: "2-3 Outfit Casual Modern", category: "pakaian", checked: false },
                    { id: 302, name: "Baju Tidur & Pakaian Dalam", category: "pakaian", checked: false },
                    { id: 303, name: "Charger HP & Cable", category: "elektronik", checked: false },
                    { id: 304, name: "Powerbank & Earphone", category: "elektronik", checked: false },
                    { id: 305, name: "Sabun, Shampo & Sikat Gigi", category: "toiletries", checked: false },
                    { id: 306, name: "Deodorant & Perfume Travel Size", category: "toiletries", checked: false },
                    { id: 307, name: "KTP / Paspor", category: "dokumen", checked: false },
                    { id: 308, name: "Tiket Transportasi & Hotel Voucher", category: "dokumen", checked: false },
                    { id: 309, name: "Sneakers Nyaman Berjalan", category: "perlengkapan", checked: false },
                    { id: 310, name: "Tas Selempang / Crossbody Bag", category: "perlengkapan", checked: false },
                    { id: 311, name: "Payung Lipat Mini", category: "perlengkapan", checked: false },
                    { id: 312, name: "Botol Minum Portable", category: "lainnya", checked: false }
                ],
                medium: [
                    { id: 313, name: "5-6 Set Outfit Mix & Match", category: "pakaian", checked: false },
                    { id: 314, name: "Outerwear (Cardigan / Jaket Tipis)", category: "pakaian", checked: false },
                    { id: 315, name: "Pakaian Dalam & Baju Tidur Cadangan", category: "pakaian", checked: false },
                    { id: 316, name: "Charger HP, Powerbank & Earphone", category: "elektronik", checked: false },
                    { id: 317, name: "Kamera Compact / Smartphone Tripod", category: "elektronik", checked: false },
                    { id: 318, name: "Toiletries Kit & Skincare Daily", category: "toiletries", checked: false },
                    { id: 319, name: "Sunscreen & Body Lotion", category: "toiletries", checked: false },
                    { id: 320, name: "KTP, Tiket PP, Voucher Hotel, E-Money", category: "dokumen", checked: false },
                    { id: 321, name: "2 Pasang Sepatu (Sneakers & Formal)", category: "perlengkapan", checked: false },
                    { id: 322, name: "Tas Selempang & Backpack Kecil", category: "perlengkapan", checked: false },
                    { id: 323, name: "Payung Lipat & Botol Minum", category: "perlengkapan", checked: false },
                    { id: 324, name: "Shopping Tote Bag", category: "lainnya", checked: false }
                ],
                long: [
                    { id: 325, name: "7+ Set Outfit Mix & Match", category: "pakaian", checked: false },
                    { id: 326, name: "Blazer / Jaket Denim & Outfit Formal", category: "pakaian", checked: false },
                    { id: 327, name: "Pakaian Dalam Lengkap", category: "pakaian", checked: false },
                    { id: 328, name: "Multi-Port Charger, Powerbank Cap. Besar", category: "elektronik", checked: false },
                    { id: 329, name: "Laptop / Tablet & Documentation Kit", category: "elektronik", checked: false },
                    { id: 330, name: "Complete Toiletries & Skincare Kit", category: "toiletries", checked: false },
                    { id: 331, name: "KTP, Tiket PP, Hotel, E-Money, Card Holder", category: "dokumen", checked: false },
                    { id: 332, name: "Sneakers & Formal Shoes", category: "perlengkapan", checked: false },
                    { id: 333, name: "Payung Lipat & Travel Tumbler", category: "perlengkapan", checked: false },
                    { id: 334, name: "Shopping Tote Bag & Ruang Koper Kosong", category: "lainnya", checked: false }
                ]
            }
        },
        camping: {
            name: "Alam / Camping",
            icon: "🌲",
            img: "assets/images/hero_suitcase.jpg",
            tip: "Pastikan tenda & flysheet terpasang rapat, bawa headlamp / lantern, serta peralatan masak ramah lingkungan.",
            items: {
                short: [
                    { id: 401, name: "Kaos Santai Outdoor & Celana Cargo", category: "pakaian", checked: false },
                    { id: 402, name: "Jaket Hangat / Hoodie", category: "pakaian", checked: false },
                    { id: 403, name: "Pakaian Dalam Ganti", category: "pakaian", checked: false },
                    { id: 404, name: "Lampu Tenda / Lantern & Powerbank", category: "elektronik", checked: false },
                    { id: 405, name: "Speaker Portable Waterproof", category: "elektronik", checked: false },
                    { id: 406, name: "Tisu Basah & Tisu Kering", category: "toiletries", checked: false },
                    { id: 407, name: "Sabun Ramah Lingkungan & Sikat Gigi", category: "toiletries", checked: false },
                    { id: 408, name: "KTP & Tiket / Voucher Camping Ground", category: "dokumen", checked: false },
                    { id: 409, name: "Tenda Camping & Sleeping Bag", category: "perlengkapan", checked: false },
                    { id: 410, name: "Matras & Kursi Lipat Outdoor", category: "perlengkapan", checked: false },
                    { id: 411, name: "Insect Repellent / Lotion Anti Nyamuk", category: "perlengkapan", checked: false },
                    { id: 412, name: "Korek Api & Senter Kecil", category: "lainnya", checked: false }
                ],
                medium: [
                    { id: 413, name: "4 Kaos Outdoor & 2 Celana Cargo", category: "pakaian", checked: false },
                    { id: 414, name: "Jaket Waterproof & Sweater Hangat", category: "pakaian", checked: false },
                    { id: 415, name: "Pakaian Dalam & Kaos Kaki Tebal", category: "pakaian", checked: false },
                    { id: 416, name: "Senter / Headlamp & Powerbank 20k", category: "elektronik", checked: false },
                    { id: 417, name: "Lantern Tenda & Portable Speaker", category: "elektronik", checked: false },
                    { id: 418, name: "Bio-degradable Soap & Toiletries Set", category: "toiletries", checked: false },
                    { id: 419, name: "Insect Repellent & Sunscreen Outdoor", category: "toiletries", checked: false },
                    { id: 420, name: "KTP, Voucher Camping & Peta Area", category: "dokumen", checked: false },
                    { id: 421, name: "Tenda, Flysheet & Sleeping Bag", category: "perlengkapan", checked: false },
                    { id: 422, name: "Matras Inflatable & Kursi Lipat", category: "perlengkapan", checked: false },
                    { id: 423, name: "Cooking Set, Nesting & Kompor Gas Mini", category: "perlengkapan", checked: false },
                    { id: 424, name: "Pisau Lipat Multi-Tool & P3K", category: "lainnya", checked: false }
                ],
                long: [
                    { id: 425, name: "6+ Set Pakaian Outdoor & Thermal Layer", category: "pakaian", checked: false },
                    { id: 426, name: "Jaket Gunung Waterproof & Jas Hujan", category: "pakaian", checked: false },
                    { id: 427, name: "Extra Socks & Gloves", category: "pakaian", checked: false },
                    { id: 428, name: "Solar Panel Charger & Powerbank Multi-Port", category: "elektronik", checked: false },
                    { id: 429, name: "Headlamp Pro & Walkie Talkie", category: "elektronik", checked: false },
                    { id: 430, name: "Outdoor Hygiene Kit & Anti-Insect Large", category: "toiletries", checked: false },
                    { id: 431, name: "KTP, Surat Izin Perkemahan & Kontak Darurat", category: "dokumen", checked: false },
                    { id: 432, name: "Tenda Heavy Duty, Flysheet & Hammock", category: "perlengkapan", checked: false },
                    { id: 433, name: "Sleeping Bag, Matras, Cooking Gear Complete", category: "perlengkapan", checked: false },
                    { id: 434, name: "Portable Water Filter & P3K Kit", category: "lainnya", checked: false }
                ]
            }
        },
        budaya: {
            name: "Wisata Budaya",
            icon: "🏛️",
            img: "assets/images/passport.jpg",
            tip: "Kenakan pakaian yang sopan dan menutup bahu/lutut untuk menghormati tempat suci & situs bersejarah.",
            items: {
                short: [
                    { id: 501, name: "2-3 Pakaian Sopan (Kain/Batik/Long Pants)", category: "pakaian", checked: false },
                    { id: 502, name: "Pakaian Casual & Baju Tidur", category: "pakaian", checked: false },
                    { id: 503, name: "Charger HP & Cable", category: "elektronik", checked: false },
                    { id: 504, name: "Powerbank & Kamera", category: "elektronik", checked: false },
                    { id: 505, name: "Sabun, Shampo & Toothbrush", category: "toiletries", checked: false },
                    { id: 506, name: "Sunscreen & Hand Sanitizer", category: "toiletries", checked: false },
                    { id: 507, name: "KTP / Paspor", category: "dokumen", checked: false },
                    { id: 508, name: "Tiket Masuk Candi / Museum / Event Budaya", category: "dokumen", checked: false },
                    { id: 509, name: "Sepatu / Sandal Selop Nyaman", category: "perlengkapan", checked: false },
                    { id: 510, name: "Topi / Payung Lipat", category: "perlengkapan", checked: false },
                    { id: 511, name: "Tas Kain / Tote Bag", category: "perlengkapan", checked: false },
                    { id: 512, name: "Kipas Lipat Portable", category: "lainnya", checked: false }
                ],
                medium: [
                    { id: 513, name: "4-5 Outfit Sopan & Modis", category: "pakaian", checked: false },
                    { id: 514, name: "Kain Tradisional / Selendang", category: "pakaian", checked: false },
                    { id: 515, name: "Pakaian Dalam & Outfits Malam", category: "pakaian", checked: false },
                    { id: 516, name: "Kamera DSLR / Mirrorless & Extra Memory", category: "elektronik", checked: false },
                    { id: 517, name: "Charger, Powerbank & Cable Kit", category: "elektronik", checked: false },
                    { id: 518, name: "Sunscreen, Lotion Kebersihan & Toiletries", category: "toiletries", checked: false },
                    { id: 519, name: "KTP, Tiket PP, Voucher Hotel, Pass Budaya", category: "dokumen", checked: false },
                    { id: 520, name: "Sepatu Jalan Santai Nyaman", category: "perlengkapan", checked: false },
                    { id: 521, name: "Topi, Payung, Tas Ransel Kecil", category: "perlengkapan", checked: false },
                    { id: 522, name: "Buku Catatan / Travel Journal", category: "lainnya", checked: false }
                ],
                long: [
                    { id: 523, name: "7+ Set Outfit Sopan & Batik", category: "pakaian", checked: false },
                    { id: 524, name: "Pakaian Adat / Formals & Jaket Ringan", category: "pakaian", checked: false },
                    { id: 525, name: "Pakaian Dalam Complete Set", category: "pakaian", checked: false },
                    { id: 526, name: "Kamera Kit Complete & Tripod Ringan", category: "elektronik", checked: false },
                    { id: 527, name: "Multi-Port Charger & Powerbank", category: "elektronik", checked: false },
                    { id: 528, name: "Complete Skincare & Toiletries Kit", category: "toiletries", checked: false },
                    { id: 529, name: "KTP, Tiket PP, Hotel Booking, Pass Tur", category: "dokumen", checked: false },
                    { id: 530, name: "Sepatu Nyaman, Payung Lipat, Tas Souvenir", category: "perlengkapan", checked: false },
                    { id: 531, name: "Kipas Lipat & Journal", category: "lainnya", checked: false }
                ]
            }
        },
        luar_negeri: {
            name: "Luar Negeri",
            icon: "✈️",
            img: "assets/images/map_plane.jpg",
            tip: "Pastikan paspor berlaku minimal 6 bulan, siapkan Universal Adapter, dan simpan salinan digital dokumen penting di HP.",
            items: {
                short: [
                    { id: 601, name: "2-3 Outfit Sesuai Musim", category: "pakaian", checked: false },
                    { id: 602, name: "Jaket / Coat & Shoes", category: "pakaian", checked: false },
                    { id: 603, name: "Pakaian Dalam & Baju Tidur", category: "pakaian", checked: false },
                    { id: 604, name: "Universal Travel Adapter", category: "elektronik", checked: false },
                    { id: 605, name: "Powerbank & Charger HP", category: "elektronik", checked: false },
                    { id: 606, name: "Travel Size Toiletries (Liquid < 100ml)", category: "toiletries", checked: false },
                    { id: 607, name: "Paspor RI (Berlaku Min. 6 Bulan)", category: "dokumen", checked: false },
                    { id: 608, name: "Tiket Pesawat PP & Visa / e-VOA", category: "dokumen", checked: false },
                    { id: 609, name: "Bukti Booking Hotel & Asuransi Travel", category: "dokumen", checked: false },
                    { id: 610, name: "Dompet Paspor / Neck Pouch", category: "perlengkapan", checked: false },
                    { id: 611, name: "Mata Uang Asing / Credit Card", category: "perlengkapan", checked: false },
                    { id: 612, name: "Luggage Tag", category: "lainnya", checked: false }
                ],
                medium: [
                    { id: 613, name: "5-6 Outfit Musiman & Extra Underwear", category: "pakaian", checked: false },
                    { id: 614, name: "Outerwear / Coat & Sepatu Nyaman", category: "pakaian", checked: false },
                    { id: 615, name: "Travel Adapter International Multi-USB", category: "elektronik", checked: false },
                    { id: 616, name: "Powerbank 10.000-20.000mAh", category: "elektronik", checked: false },
                    { id: 617, name: "E-SIM / Roaming Data / Pocket Wifi", category: "elektronik", checked: false },
                    { id: 618, name: "Toiletries Kit (< 100ml) & Skincare", category: "toiletries", checked: false },
                    { id: 619, name: "Paspor RI, Visa, Tiket PP, Hotel Booking", category: "dokumen", checked: false },
                    { id: 620, name: "Asuransi Perjalanan International", category: "dokumen", checked: false },
                    { id: 621, name: "Koper TSA Lock & Timbangan Koper Digital", category: "perlengkapan", checked: false },
                    { id: 622, name: "Dompet Paspor & Obat-obatan Pribadi", category: "perlengkapan", checked: false }
                ],
                long: [
                    { id: 623, name: "8+ Set Outfit Sesuai Musim & Thermal Layer", category: "pakaian", checked: false },
                    { id: 624, name: "2 Pasang Sepatu (Walk & Formal)", category: "pakaian", checked: false },
                    { id: 625, name: "Universal Adapter Multi-Port & Powerbank", category: "elektronik", checked: false },
                    { id: 626, name: "E-SIM / Wifi & Power Converter", category: "elektronik", checked: false },
                    { id: 627, name: "Complete Toiletries Travel Kit & Skincare", category: "toiletries", checked: false },
                    { id: 628, name: "Paspor RI, Visa / Permit, Tiket PP, Hotel", category: "dokumen", checked: false },
                    { id: 629, name: "Asuransi High Coverage & Salinan Digital", category: "dokumen", checked: false },
                    { id: 630, name: "Koper TSA Hardcase, Luggage Scale, Pouch", category: "perlengkapan", checked: false },
                    { id: 631, name: "Payung Lipat & Emergency Cash", category: "lainnya", checked: false }
                ]
            }
        }
    };

    // Load active draft or initialize currentTrip
    let currentTripDraft = JSON.parse(localStorage.getItem('currentTrip'));
    if (!currentTripDraft) {
        currentTripDraft = {
            id: Date.now(),
            destination: "Pantai",
            destinationType: "pantai",
            duration: "short",
            departureDate: "",
            returnDate: "",
            travelers: 2,
            checklist: [],
            documents: [],
            transportation: [],
            budget: { bgTransport: 700000, bgHotel: 800000, bgMakan: 500000, bgAktivitas: 300000, bgLainnya: 200000, total: 2500000 },
            packingTips: [],
            status: "Dalam Persiapan",
            updatedAt: new Date().toISOString()
        };
    }

    let activeDest = currentTripDraft.destinationType || 'pantai';
    let activeDuration = currentTripDraft.duration || 'short';
    let editingTripId = null;

    let savedDestChecklists = JSON.parse(localStorage.getItem('travelready_dest_checklists'));
    if (!savedDestChecklists) {
        savedDestChecklists = {};
        Object.keys(defaultDestTemplates).forEach(dKey => {
            savedDestChecklists[dKey] = {};
            ['short', 'medium', 'long'].forEach(dur => {
                savedDestChecklists[dKey][dur] = JSON.parse(JSON.stringify(defaultDestTemplates[dKey].items[dur]));
            });
        });
        localStorage.setItem('travelready_dest_checklists', JSON.stringify(savedDestChecklists));
    }

    const destinationGrid = document.getElementById('destinationGrid');
    const durationSelector = document.getElementById('durationSelector');
    const destChecklistTitle = document.getElementById('destChecklistTitle');
    const destProgressText = document.getElementById('destProgressText');
    const destProgressBar = document.getElementById('destProgressBar');
    const destStatusText = document.getElementById('destStatusText');
    const destIllustrationImg = document.getElementById('destIllustrationImg');
    const destChecklistBody = document.getElementById('destChecklistBody');
    const destPackingTipText = document.getElementById('destPackingTipText');
    const resetChecklistBtn = document.getElementById('resetChecklistBtn');

    const openAddChecklistModalBtn = document.getElementById('openAddChecklistModalBtn');
    const addChecklistModal = document.getElementById('addChecklistModal');
    const closeAddChecklistModalBtn = document.getElementById('closeAddChecklistModalBtn');
    const saveChecklistBtn = document.getElementById('saveChecklistBtn');
    const newItemName = document.getElementById('newItemName');
    const newItemCategory = document.getElementById('newItemCategory');

    function getBudgetObj() {
        const bgTransport = Math.max(0, parseFloat(document.getElementById('bgTransport')?.value) || 0);
        const bgHotel = Math.max(0, parseFloat(document.getElementById('bgHotel')?.value) || 0);
        const bgMakan = Math.max(0, parseFloat(document.getElementById('bgMakan')?.value) || 0);
        const bgAktivitas = Math.max(0, parseFloat(document.getElementById('bgAktivitas')?.value) || 0);
        const bgLainnya = Math.max(0, parseFloat(document.getElementById('bgLainnya')?.value) || 0);
        const total = bgTransport + bgHotel + bgMakan + bgAktivitas + bgLainnya;
        return { bgTransport, bgHotel, bgMakan, bgAktivitas, bgLainnya, total };
    }

    function saveDestChecklistsToStorage() {
        localStorage.setItem('travelready_dest_checklists', JSON.stringify(savedDestChecklists));
    }

    function updateCurrentTripStorage() {
        if (!currentTripDraft) {
            currentTripDraft = { id: Date.now() };
        }
        currentTripDraft.destinationType = activeDest;
        currentTripDraft.destination = defaultDestTemplates[activeDest]?.name || "Pantai";
        currentTripDraft.duration = activeDuration;
        currentTripDraft.checklist = getCurrentItemList();
        currentTripDraft.documents = typeof docsData !== 'undefined' ? docsData : (currentTripDraft.documents || []);
        currentTripDraft.transportation = typeof transportSchedules !== 'undefined' ? transportSchedules : (currentTripDraft.transportation || []);
        currentTripDraft.budget = getBudgetObj();
        currentTripDraft.packingTips = defaultDestTemplates[activeDest]?.tip || "";
        currentTripDraft.status = currentTripDraft.status || "Dalam Persiapan";
        currentTripDraft.updatedAt = new Date().toISOString();

        localStorage.setItem('currentTrip', JSON.stringify(currentTripDraft));
        console.log("currentTrip:", currentTripDraft);
    }

    function saveCurrentTripDraft() {
        updateCurrentTripStorage();
    }

    function getCurrentItemList() {
        if (!savedDestChecklists[activeDest]) {
            savedDestChecklists[activeDest] = {};
        }
        if (!savedDestChecklists[activeDest][activeDuration]) {
            const template = defaultDestTemplates[activeDest]?.items[activeDuration] || [];
            savedDestChecklists[activeDest][activeDuration] = JSON.parse(JSON.stringify(template));
        }
        return savedDestChecklists[activeDest][activeDuration];
    }

    function renderDestChecklist() {
        if (!destChecklistBody) return;

        const templateMeta = defaultDestTemplates[activeDest] || defaultDestTemplates.pantai;
        const durLabel = activeDuration === 'short' ? '1–3 Hari' : (activeDuration === 'medium' ? '4–7 Hari' : '> 7 Hari');
        
        if (destChecklistTitle) {
            destChecklistTitle.textContent = `Checklist Barang: ${templateMeta.name} (${durLabel})`;
        }
        if (destPackingTipText) {
            destPackingTipText.textContent = templateMeta.tip;
        }
        if (destIllustrationImg) {
            destIllustrationImg.src = templateMeta.img;
        }

        const items = getCurrentItemList();
        destChecklistBody.innerHTML = '';

        let completedCount = 0;
        let totalCount = items.length;

        const categoriesOrder = [
            { key: 'pakaian', label: 'Pakaian & Fashion', icon: '👕' },
            { key: 'elektronik', label: 'Elektronik & Gadget', icon: '⚡' },
            { key: 'toiletries', label: 'Toiletries & Care', icon: '🧴' },
            { key: 'dokumen', label: 'Dokumen & Tiket', icon: '📄' },
            { key: 'perlengkapan', label: 'Perlengkapan Utama', icon: '🎒' },
            { key: 'lainnya', label: 'Lainnya / Tambahan', icon: '📦' }
        ];

        categoriesOrder.forEach(cat => {
            const catItems = items.filter(item => item.category === cat.key);
            if (catItems.length === 0) return;

            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'checklist-category-group margin-top-sm';

            const catHeader = document.createElement('h4');
            catHeader.className = 'category-group-title';
            catHeader.innerHTML = `<span>${cat.icon}</span> ${cat.label}`;
            categoryGroup.appendChild(catHeader);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'checklist-items-container';

            catItems.forEach(item => {
                if (item.checked) completedCount++;

                const itemRow = document.createElement('div');
                itemRow.className = `checklist-item ${item.checked ? 'completed' : ''}`;
                itemRow.setAttribute('data-id', item.id);

                itemRow.innerHTML = `
                    <input type="checkbox" ${item.checked ? 'checked' : ''}>
                    <span class="item-name">${item.name}</span>
                    <button class="item-delete-btn" data-id="${item.id}" title="Hapus Item">&times;</button>
                `;

                itemRow.addEventListener('click', (e) => {
                    const checkbox = itemRow.querySelector('input[type="checkbox"]');
                    const isDelete = e.target.classList.contains('item-delete-btn');

                    if (isDelete) {
                        e.stopPropagation();
                        const idDel = parseInt(e.target.getAttribute('data-id'));
                        savedDestChecklists[activeDest][activeDuration] = items.filter(i => i.id !== idDel);
                        saveDestChecklistsToStorage();
                        saveCurrentTripDraft();
                        renderDestChecklist();
                        showToast("Item berhasil dihapus.");
                        return;
                    }

                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }

                    item.checked = checkbox.checked;
                    saveDestChecklistsToStorage();
                    saveCurrentTripDraft();
                    renderDestChecklist();
                });

                itemsContainer.appendChild(itemRow);
            });

            categoryGroup.appendChild(itemsContainer);
            destChecklistBody.appendChild(categoryGroup);
        });

        const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
        if (destProgressText) destProgressText.textContent = `${completedCount} dari ${totalCount} barang siap`;
        if (destProgressBar) destProgressBar.style.width = `${percentage}%`;

        if (destStatusText) {
            if (completedCount === totalCount && totalCount > 0) {
                destStatusText.textContent = "🎉 Checklist Selesai! Semua barang persiapan kamu sudah 100% siap.";
            } else if (completedCount > 0) {
                destStatusText.textContent = `Persiapan berjalan baik (${percentage}%). Tetap periksa sisa barangmu!`;
            } else {
                destStatusText.textContent = "Belum ada barang yang dicentang. Ayo persiapkan!";
            }
        }
    }

    if (destinationGrid) {
        const destCards = destinationGrid.querySelectorAll('.dest-card');
        destCards.forEach(card => {
            card.addEventListener('click', () => {
                destCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                activeDest = card.getAttribute('data-dest');
                saveCurrentTripDraft();
                renderDestChecklist();
            });
        });
    }

    if (durationSelector) {
        const durBtns = durationSelector.querySelectorAll('.select-btn');
        durBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                durBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDuration = btn.getAttribute('data-duration');
                saveCurrentTripDraft();
                renderDestChecklist();
            });
        });
    }

    if (resetChecklistBtn) {
        resetChecklistBtn.addEventListener('click', () => {
            const template = defaultDestTemplates[activeDest]?.items[activeDuration] || [];
            savedDestChecklists[activeDest][activeDuration] = JSON.parse(JSON.stringify(template));
            saveDestChecklistsToStorage();
            saveCurrentTripDraft();
            renderDestChecklist();
            showToast("Checklist destinasi ini berhasil direset ke daftar awal!");
        });
    }

    if (openAddChecklistModalBtn && addChecklistModal && closeAddChecklistModalBtn && saveChecklistBtn) {
        openAddChecklistModalBtn.addEventListener('click', () => {
            addChecklistModal.classList.add('active');
        });

        closeAddChecklistModalBtn.addEventListener('click', () => {
            addChecklistModal.classList.remove('active');
        });

        saveChecklistBtn.addEventListener('click', () => {
            const name = newItemName.value.trim();
            const cat = newItemCategory.value;

            if (!name) {
                showToast("Harap isi nama barang terlebih dahulu.");
                return;
            }

            const newItem = {
                id: Date.now(),
                name: name,
                category: cat,
                checked: false
            };

            const currentList = getCurrentItemList();
            currentList.push(newItem);
            saveDestChecklistsToStorage();
            saveCurrentTripDraft();
            renderDestChecklist();

            addChecklistModal.classList.remove('active');
            newItemName.value = '';
            showToast("Item baru berhasil ditambahkan!");
        });
    }

    // Section 1 Save Button
    const saveChecklistSecBtn = document.getElementById('saveChecklistSecBtn');
    if (saveChecklistSecBtn) {
        saveChecklistSecBtn.addEventListener('click', () => {
            saveCurrentTripDraft();
            showToast("Checklist berhasil disimpan!");
            const docSec = document.getElementById('dokumen');
            if (docSec) docSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    renderDestChecklist();

    /* ==========================================================================
       3. DOKUMEN FEATURE, LOCALSTORAGE & INDEXEDDB (PDF UPLOAD)
       ========================================================================== */
    const defaultDocs = [
        { id: 1, name: 'KTP / Kartu Identitas', category: 'domestik', checked: false, required: 'Wajib Ada' },
        { id: 2, name: 'SIM A / C', category: 'domestik', checked: false, required: 'Opsional' },
        { id: 3, name: 'Tiket Perjalanan (Kereta/Bus/Pesawat)', category: 'domestik', checked: false, required: 'Wajib Ada' },
        { id: 4, name: 'Bukti Booking Hotel / Akomodasi', category: 'domestik', checked: false, required: 'Wajib Ada' },
        { id: 5, name: 'Paspor RI (Min. 6 Bulan)', category: 'internasional', checked: false, required: 'Wajib Ada' },
        { id: 6, name: 'Visa Kunjungan / e-VOA', category: 'internasional', checked: false, required: 'Wajib Ada' },
        { id: 7, name: 'Tiket Pesawat Pulang Pergi', category: 'internasional', checked: false, required: 'Wajib Ada' },
        { id: 8, name: 'Asuransi Perjalanan Internasional', category: 'internasional', checked: false, required: 'Sangat Disarankan' }
    ];

    let docsData = JSON.parse(localStorage.getItem('travelready_documents')) || defaultDocs;

    const domestikDocList = document.getElementById('domestikDocList');
    const internasionalDocList = document.getElementById('internasionalDocList');
    const openAddDocModalBtn = document.getElementById('openAddDocModalBtn');
    const addDocModal = document.getElementById('addDocModal');
    const closeAddDocModalBtn = document.getElementById('closeAddDocModalBtn');
    const saveDocBtn = document.getElementById('saveDocBtn');
    const newDocName = document.getElementById('newDocName');
    const newDocCategory = document.getElementById('newDocCategory');

    function saveDocsToStorage() {
        localStorage.setItem('travelready_documents', JSON.stringify(docsData));
        updateCurrentTripStorage();
    }

    function renderDocs() {
        if (!domestikDocList || !internasionalDocList) return;
        domestikDocList.innerHTML = '';
        internasionalDocList.innerHTML = '';

        docsData.forEach(doc => {
            const row = document.createElement('div');
            row.className = `doc-item-row ${doc.checked ? 'completed' : ''}`;
            row.innerHTML = `
                <input type="checkbox" ${doc.checked ? 'checked' : ''}>
                <div class="doc-item-info">
                    <strong>${doc.name}</strong>
                </div>
                <span class="badge-status status-required">${doc.required || 'Siapkan'}</span>
                ${doc.id > 8 ? `<button class="item-delete-btn" data-id="${doc.id}">&times;</button>` : ''}
            `;

            row.addEventListener('click', (e) => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (e.target.classList.contains('item-delete-btn')) {
                    e.stopPropagation();
                    const idDel = parseInt(e.target.getAttribute('data-id'));
                    docsData = docsData.filter(d => d.id !== idDel);
                    saveDocsToStorage();
                    renderDocs();
                    showToast("Dokumen berhasil dihapus.");
                    return;
                }

                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }

                doc.checked = checkbox.checked;
                saveDocsToStorage();
                renderDocs();
            });

            if (doc.category === 'domestik') {
                domestikDocList.appendChild(row);
            } else {
                internasionalDocList.appendChild(row);
            }
        });
    }

    if (openAddDocModalBtn && addDocModal && closeAddDocModalBtn && saveDocBtn) {
        openAddDocModalBtn.addEventListener('click', () => {
            addDocModal.classList.add('active');
        });

        closeAddDocModalBtn.addEventListener('click', () => {
            addDocModal.classList.remove('active');
        });

        saveDocBtn.addEventListener('click', () => {
            const name = newDocName.value.trim();
            const cat = newDocCategory.value;

            if (!name) {
                showToast("Harap isi nama dokumen.");
                return;
            }

            docsData.push({
                id: Date.now(),
                name: name,
                category: cat,
                checked: false,
                required: 'Dokumen Tambahan'
            });

            saveDocsToStorage();
            renderDocs();
            addDocModal.classList.remove('active');
            newDocName.value = '';
            showToast("Dokumen baru berhasil disimpan!");
        });
    }

    // Section 2 Save Button
    const saveDocsSecBtn = document.getElementById('saveDocsSecBtn');
    if (saveDocsSecBtn) {
        saveDocsSecBtn.addEventListener('click', () => {
            saveDocsToStorage();
            showToast("Dokumen berhasil disimpan!");
            const transSec = document.getElementById('transportasi');
            if (transSec) transSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    renderDocs();

    const openDocModalBtn = document.getElementById('openDocModalBtn');
    const confirmDocBtn = document.getElementById('confirmDocBtn');
    const docModalOverlay = document.getElementById('docModalOverlay');

    if (openDocModalBtn && docModalOverlay && confirmDocBtn) {
        openDocModalBtn.addEventListener('click', () => {
            docModalOverlay.classList.add('active');
        });

        confirmDocBtn.addEventListener('click', () => {
            docModalOverlay.classList.remove('active');
            showToast("Dokumen terverifikasi! Siap berangkat.");
        });

        docModalOverlay.addEventListener('click', (e) => {
            if (e.target === docModalOverlay) {
                docModalOverlay.classList.remove('active');
            }
        });
    }

    /* --- INDEXEDDB FOR PDF DOCUMENTS --- */
    let db;
    const dbRequest = indexedDB.open('TravelReadyDB', 1);

    dbRequest.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('pdfDocuments')) {
            db.createObjectStore('pdfDocuments', { keyPath: 'id' });
        }
    };

    dbRequest.onsuccess = (e) => {
        db = e.target.result;
        renderPDFList();
    };

    dbRequest.onerror = (e) => {
        console.error("IndexedDB Error:", e.target.error);
    };

    const pdfDropzone = document.getElementById('pdfDropzone');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfFileList = document.getElementById('pdfFileList');

    if (pdfDropzone && pdfFileInput) {
        pdfDropzone.addEventListener('click', () => pdfFileInput.click());

        pdfFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handlePDFUpload(file);
        });

        pdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropzone.style.backgroundColor = 'var(--light-maroon-hover)';
        });

        pdfDropzone.addEventListener('dragleave', () => {
            pdfDropzone.style.backgroundColor = 'var(--light-maroon)';
        });

        pdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropzone.style.backgroundColor = 'var(--light-maroon)';
            const file = e.dataTransfer.files[0];
            if (file) handlePDFUpload(file);
        });
    }

    function handlePDFUpload(file) {
        if (file.type !== 'application/pdf') {
            showToast("Format file harus PDF.");
            return;
        }

        const maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) {
            showToast("Ukuran file terlalu besar (Maksimal 10MB).");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfRecord = {
                id: Date.now(),
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                blob: file,
                uploadTime: new Date().toLocaleDateString('id-ID')
            };

            const tx = db.transaction('pdfDocuments', 'readwrite');
            const store = tx.objectStore('pdfDocuments');
            store.put(pdfRecord);

            tx.oncomplete = () => {
                renderPDFList();
                showToast("File PDF berhasil disimpan secara offline!");
            };
        };
        reader.readAsArrayBuffer(file);
    }

    function renderPDFList() {
        if (!pdfFileList || !db) return;
        pdfFileList.innerHTML = '';

        const tx = db.transaction('pdfDocuments', 'readonly');
        const store = tx.objectStore('pdfDocuments');
        const req = store.getAll();

        req.onsuccess = () => {
            const files = req.result;
            if (files.length === 0) {
                pdfFileList.innerHTML = '<p class="text-muted text-center" style="font-size: 0.85rem;">Belum ada dokumen PDF yang diunggah.</p>';
                return;
            }

            files.forEach(item => {
                const div = document.createElement('div');
                div.className = 'pdf-file-item';
                div.innerHTML = `
                    <div class="pdf-file-details">
                        <span class="pdf-icon">📄</span>
                        <div>
                            <span class="pdf-name">${item.name}</span>
                            <span class="pdf-size">${item.size} • Tersimpan Offline</span>
                        </div>
                    </div>
                    <div class="pdf-actions">
                        <button class="btn btn-outline btn-sm open-pdf-btn" data-id="${item.id}">Buka PDF</button>
                        <button class="btn btn-danger-link delete-pdf-btn" data-id="${item.id}">Hapus</button>
                    </div>
                `;

                div.querySelector('.open-pdf-btn').addEventListener('click', () => {
                    openPDFBlob(item.id);
                });

                div.querySelector('.delete-pdf-btn').addEventListener('click', () => {
                    const delTx = db.transaction('pdfDocuments', 'readwrite');
                    const delStore = delTx.objectStore('pdfDocuments');
                    delStore.delete(item.id);

                    delTx.oncomplete = () => {
                        renderPDFList();
                        showToast("Dokumen PDF berhasil dihapus.");
                    };
                });

                pdfFileList.appendChild(div);
            });
        };
    }

    function openPDFBlob(pdfId) {
        if (!db) return;
        const getTx = db.transaction('pdfDocuments', 'readonly');
        const getStore = getTx.objectStore('pdfDocuments');
        const getReq = getStore.get(pdfId);

        getReq.onsuccess = () => {
            const rec = getReq.result;
            if (rec && rec.blob) {
                const blobUrl = URL.createObjectURL(rec.blob);
                window.open(blobUrl, '_blank');
            } else {
                showToast("File PDF tidak tersedia atau telah dihapus.");
            }
        };
    }

    /* ==========================================================================
       4. DYNAMIC TRANSPORTATION SYSTEM (KERETA, BUS, PESAWAT, MOBIL)
       ========================================================================== */
    const transportCards = document.querySelectorAll('.transport-card');
    const trTypeInput = document.getElementById('trType');
    const trOriginLabel = document.getElementById('trOriginLabel');
    const trDestLabel = document.getElementById('trDestLabel');
    const trNumberLabel = document.getElementById('trNumberLabel');
    const trNotesLabel = document.getElementById('trNotesLabel');
    const trTimeDept = document.getElementById('trTimeDept');
    const trTimePrep = document.getElementById('trTimePrep');
    const trOrigin = document.getElementById('trOrigin');
    const trDest = document.getElementById('trDest');
    const trNumber = document.getElementById('trNumber');
    const trNotes = document.getElementById('trNotes');
    const prepSummaryBox = document.getElementById('prepSummaryBox');
    const saveTransportBtn = document.getElementById('saveTransportBtn');
    const saveTransSecBtn = document.getElementById('saveTransSecBtn');
    const transportTimeline = document.getElementById('transportTimeline');

    let transportSchedules = JSON.parse(localStorage.getItem('travelready_transports')) || [
        {
            id: 1,
            type: 'kereta',
            timePrep: '06:30',
            timeDept: '08:00',
            origin: 'Stasiun Cirebon',
            dest: 'Stasiun Gambir',
            number: 'KA 25A (Argo Cheribon)',
            notes: 'Persiapan sebelum berangkat 1 jam 30 menit.'
        }
    ];

    const transportFormLabels = {
        kereta: {
            origin: "Stasiun Keberangkatan",
            dest: "Stasiun Tujuan",
            number: "Nomor Kereta / Kode (Opsional)",
            notes: "Peron / Catatan",
            originPlaceholder: "Contoh: Stasiun Cirebon",
            destPlaceholder: "Contoh: Stasiun Gambir",
            numberPlaceholder: "Contoh: KA 25A (Argo Cheribon)",
            notesPlaceholder: "Contoh: Peron 3, Kereta Eksekutif",
            defaultPrepDiff: "06:30",
            defaultDept: "08:00",
            tipAdvice: "💡 Disarankan persiapan min. 1.5 jam sebelum jam berangkat Kereta."
        },
        bus: {
            origin: "Terminal / Pool Keberangkatan",
            dest: "Terminal / Pool Tujuan",
            number: "Nama PO / Nomor Bus (Opsional)",
            notes: "Nomor Kursi / Catatan",
            originPlaceholder: "Contoh: Terminal Kampung Rambutan",
            destPlaceholder: "Contoh: Terminal Tirtonadi Solo",
            numberPlaceholder: "Contoh: PO Sinar Jaya (Bus 12)",
            notesPlaceholder: "Contoh: Kursi 2A - Executive",
            defaultPrepDiff: "07:00",
            defaultDept: "08:00",
            tipAdvice: "💡 Disarankan persiapan min. 1 jam sebelum jam keberangkatan Bus."
        },
        pesawat: {
            origin: "Bandara Keberangkatan",
            dest: "Bandara Tujuan",
            number: "Nomor Penerbangan / Kode (Opsional)",
            notes: "Terminal / Gate / Bagasi",
            originPlaceholder: "Contoh: Bandara Soekarno-Hatta (CGK)",
            destPlaceholder: "Contoh: Bandara Ngurah Rai (DPS)",
            numberPlaceholder: "Contoh: GA-402 (Garuda Indonesia)",
            notesPlaceholder: "Contoh: Terminal 3, Gate 12, Bagasi 20kg",
            defaultPrepDiff: "06:00",
            defaultDept: "08:00",
            tipAdvice: "⚠️ Wajib persiapan min. 2 jam sebelum jam terbang untuk Check-in & Boarding!"
        },
        mobil: {
            origin: "Lokasi Keberangkatan",
            dest: "Lokasi Tujuan",
            number: "Mobil / Plat Nomor (Opsional)",
            notes: "Rute / Rest Area / Catatan",
            originPlaceholder: "Contoh: Rumah / Hotel Jakarta",
            destPlaceholder: "Contoh: Villa / Destinasi Bandung",
            numberPlaceholder: "Contoh: Avanza Hitam (B 1234 ABC)",
            notesPlaceholder: "Contoh: Rute Tol Cipularang, Istirahat Rest Area KM 57",
            defaultPrepDiff: "07:15",
            defaultDept: "08:00",
            tipAdvice: "💡 Disarankan siapkan kendaraan & barang min. 45 menit sebelum berangkat."
        }
    };

    function updateTransportFormUI(type) {
        trTypeInput.value = type;
        const labels = transportFormLabels[type] || transportFormLabels.kereta;

        if (trOriginLabel) trOriginLabel.innerHTML = `${labels.origin} <span class="required">*</span>`;
        if (trDestLabel) trDestLabel.innerHTML = `${labels.dest} <span class="required">*</span>`;
        if (trNumberLabel) trNumberLabel.textContent = labels.number;
        if (trNotesLabel) trNotesLabel.textContent = labels.notes;

        if (trOrigin) trOrigin.placeholder = labels.originPlaceholder;
        if (trDest) trDest.placeholder = labels.destPlaceholder;
        if (trNumber) trNumber.placeholder = labels.numberPlaceholder;
        if (trNotes) trNotes.placeholder = labels.notesPlaceholder;

        calculatePrepDiff(labels.tipAdvice);
    }

    transportCards.forEach(card => {
        card.addEventListener('click', () => {
            transportCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const type = card.getAttribute('data-transport');
            updateTransportFormUI(type);
        });
    });

    function calculatePrepDiff(customAdvice = null) {
        if (!trTimeDept || !trTimePrep || !prepSummaryBox) return;

        const deptVal = trTimeDept.value;
        const prepVal = trTimePrep.value;

        if (!deptVal || !prepVal) return;

        const [dH, dM] = deptVal.split(':').map(Number);
        const [pH, pM] = prepVal.split(':').map(Number);

        let deptMinutes = dH * 60 + dM;
        let prepMinutes = pH * 60 + pM;

        if (deptMinutes < prepMinutes) {
            deptMinutes += 24 * 60;
        }

        const diffMinutes = deptMinutes - prepMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;

        let diffStr = '';
        if (hours > 0) diffStr += `${hours} jam `;
        if (mins > 0 || hours === 0) diffStr += `${mins} menit`;

        const curType = trTypeInput.value || 'kereta';
        const labels = transportFormLabels[curType] || transportFormLabels.kereta;
        const advice = customAdvice || labels.tipAdvice;

        prepSummaryBox.innerHTML = `
            <span>⏱️ Selisih Waktu Persiapan: <strong>${diffStr}</strong> sebelum berangkat</span>
            <br><small style="color: var(--deep-maroon); font-size: 0.8rem;">${advice}</small>
        `;
    }

    if (trTimeDept && trTimePrep) {
        trTimeDept.addEventListener('change', () => calculatePrepDiff());
        trTimePrep.addEventListener('change', () => calculatePrepDiff());
    }

    function saveTransportsToStorage() {
        localStorage.setItem('travelready_transports', JSON.stringify(transportSchedules));
        updateCurrentTripStorage();
    }

    function renderTransportTimeline() {
        if (!transportTimeline) return;
        transportTimeline.innerHTML = '';

        if (transportSchedules.length === 0) {
            transportTimeline.innerHTML = '<p class="text-muted text-center">Belum ada jadwal transportasi yang ditambahkan.</p>';
            return;
        }

        const sorted = [...transportSchedules].sort((a, b) => a.timePrep.localeCompare(b.timePrep));

        sorted.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            const trIcon = item.type === 'pesawat' ? '✈️' : (item.type === 'bus' ? '🚌' : (item.type === 'mobil' ? '🚗' : '🚆'));
            div.innerHTML = `
                <div class="timeline-header">
                    <span class="timeline-time">⏰ ${item.timePrep} (Persiapan) → ${item.timeDept} (${capitalize(item.type)})</span>
                    <span class="badge-tag">${trIcon} ${capitalize(item.type)}</span>
                </div>
                <div class="timeline-route">${item.origin} → ${item.dest}</div>
                ${item.number ? `<div class="timeline-notes">No/Kode: ${item.number}</div>` : ''}
                ${item.notes ? `<div class="timeline-notes">Catatan: ${item.notes}</div>` : ''}
                <div class="margin-top-xs text-right">
                    <button class="btn btn-danger-link delete-tr-btn" data-id="${item.id}">Hapus Jadwal</button>
                </div>
            `;

            div.querySelector('.delete-tr-btn').addEventListener('click', () => {
                transportSchedules = transportSchedules.filter(t => t.id !== item.id);
                saveTransportsToStorage();
                renderTransportTimeline();
                showToast("Jadwal transportasi dihapus.");
            });

            transportTimeline.appendChild(div);
        });
    }

    if (saveTransportBtn) {
        saveTransportBtn.addEventListener('click', () => {
            const origin = trOrigin.value.trim();
            const dest = trDest.value.trim();
            const timeDept = trTimeDept.value;
            const timePrep = trTimePrep.value;

            if (!origin || !dest || !timeDept || !timePrep) {
                showToast("Harap isi asal, tujuan, dan jam keberangkatan.");
                return;
            }

            const newSchedule = {
                id: Date.now(),
                type: trTypeInput.value,
                timePrep: timePrep,
                timeDept: timeDept,
                origin: origin,
                dest: dest,
                number: trNumber.value.trim(),
                notes: trNotes.value.trim()
            };

            transportSchedules.push(newSchedule);
            saveTransportsToStorage();
            renderTransportTimeline();

            trOrigin.value = '';
            trDest.value = '';
            trNumber.value = '';
            trNotes.value = '';
            showToast("Jadwal transportasi berhasil disimpan!");
        });
    }

    // Section 3 Save Button
    if (saveTransSecBtn) {
        saveTransSecBtn.addEventListener('click', () => {
            saveTransportsToStorage();
            showToast("Transportasi berhasil disimpan!");
            const budgetSec = document.getElementById('budget');
            if (budgetSec) budgetSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    updateTransportFormUI('kereta');
    renderTransportTimeline();

    /* ==========================================================================
       5. BUDGET CALCULATOR & MAIN TRIP FINISH HANDLER
       ========================================================================== */
    const calcBudgetBtn = document.getElementById('calcBudgetBtn');
    const totalBudgetDisplay = document.getElementById('totalBudgetDisplay');
    const finishTripBtn = document.getElementById('finishTripBtn');

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(number);
    }

    function calculateBudget(showToastNotification = true) {
        const budgetObj = getBudgetObj();
        localStorage.setItem('travelready_budget', JSON.stringify(budgetObj));
        updateCurrentTripStorage();

        if (totalBudgetDisplay) {
            totalBudgetDisplay.textContent = formatRupiah(budgetObj.total);
        }

        const valTr = document.getElementById('valTransport');
        const valHt = document.getElementById('valHotel');
        const valMk = document.getElementById('valMakan');
        const valAk = document.getElementById('valAktivitas');
        const valLn = document.getElementById('valLainnya');

        if (valTr) valTr.textContent = formatRupiah(budgetObj.bgTransport);
        if (valHt) valHt.textContent = formatRupiah(budgetObj.bgHotel);
        if (valMk) valMk.textContent = formatRupiah(budgetObj.bgMakan);
        if (valAk) valAk.textContent = formatRupiah(budgetObj.bgAktivitas);
        if (valLn) valLn.textContent = formatRupiah(budgetObj.bgLainnya);

        const safeTotal = budgetObj.total === 0 ? 1 : budgetObj.total;
        const items = [
            { el: document.querySelectorAll('.breakdown-bar-fill')[0], val: budgetObj.bgTransport },
            { el: document.querySelectorAll('.breakdown-bar-fill')[1], val: budgetObj.bgHotel },
            { el: document.querySelectorAll('.breakdown-bar-fill')[2], val: budgetObj.bgMakan },
            { el: document.querySelectorAll('.breakdown-bar-fill')[3], val: budgetObj.bgAktivitas },
            { el: document.querySelectorAll('.breakdown-bar-fill')[4], val: budgetObj.bgLainnya }
        ];

        items.forEach(item => {
            if (item.el) {
                const pct = Math.round((item.val / safeTotal) * 100);
                item.el.style.width = `${pct}%`;
            }
        });

        if (showToastNotification) {
            showToast("Estimasi budget berhasil dihitung!");
        }
    }

    if (calcBudgetBtn) {
        calcBudgetBtn.addEventListener('click', () => calculateBudget(true));
    }

    if (finishTripBtn) {
        finishTripBtn.addEventListener('click', () => {
            saveCurrentTrip();
        });
    }

    /* ==========================================================================
       6. AUTOMATIC TRAVEL RECAP SNAPSHOT & HISTORY ENGINE (`travelHistory`)
       ========================================================================== */
    const riwayatGrid = document.getElementById('riwayatGrid');
    const riwayatEmptyState = document.getElementById('riwayatEmptyState');
    let deleteTargetId = null;

    function saveCurrentTrip() {
        calculateBudget(false);
        updateCurrentTripStorage();

        const currentTripData = JSON.parse(localStorage.getItem('currentTrip'));
        if (!currentTripData) return;

        const destMeta = defaultDestTemplates[currentTripData.destinationType || 'pantai'] || defaultDestTemplates.pantai;
        const durLabel = currentTripData.duration === 'short' ? '1–3 Hari' : (currentTripData.duration === 'medium' ? '4–7 Hari' : '> 7 Hari');
        
        const currentChecklist = JSON.parse(JSON.stringify(currentTripData.checklist || []));
        const checkedItemsOnly = currentChecklist.filter(item => item.checked === true);
        const totalChecklistCount = currentChecklist.length;
        const checkedChecklistCount = checkedItemsOnly.length;

        const currentDocs = JSON.parse(JSON.stringify(currentTripData.documents || []));
        const checkedDocsCount = currentDocs.filter(d => d.checked === true).length;
        const totalDocsCount = currentDocs.length;

        const currentTransports = JSON.parse(JSON.stringify(currentTripData.transportation || []));
        const budgetSnapshot = currentTripData.budget || { bgTransport: 0, bgHotel: 0, bgMakan: 0, bgAktivitas: 0, bgLainnya: 0, total: 0 };
        const totalBudget = budgetSnapshot.total || budgetSnapshot.totalBudget || 0;

        let statusText = "Persiapan Selesai";
        if (checkedChecklistCount < totalChecklistCount || checkedDocsCount < totalDocsCount) {
            statusText = checkedChecklistCount > 0 ? "Persiapan Berjalan" : "Belum Lengkap";
        }

        const history = JSON.parse(localStorage.getItem('travelHistory') || '[]');

        if (editingTripId) {
            const index = history.findIndex(t => t.id === editingTripId);
            if (index !== -1) {
                history[index] = {
                    ...history[index],
                    destination: destMeta.name,
                    destType: currentTripData.destinationType,
                    duration: durLabel,
                    checklist: {
                        total: totalChecklistCount,
                        checkedCount: checkedChecklistCount,
                        items: currentChecklist,
                        checkedOnly: checkedItemsOnly
                    },
                    documents: {
                        total: totalDocsCount,
                        checkedCount: checkedDocsCount,
                        items: currentDocs
                    },
                    transportation: currentTransports,
                    budget: { ...budgetSnapshot, totalBudget },
                    packingTip: destMeta.tip,
                    status: statusText,
                    updatedAt: new Date().toISOString()
                };
                editingTripId = null;
                showToast("Perjalanan berhasil diperbarui di Riwayat!");
            }
        } else {
            const snapshotTrip = {
                id: Date.now(),
                destination: destMeta.name,
                destType: currentTripData.destinationType,
                duration: durLabel,
                dates: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                people: currentTripData.travelers || 2,
                checklist: {
                    total: totalChecklistCount,
                    checkedCount: checkedChecklistCount,
                    items: currentChecklist,
                    checkedOnly: checkedItemsOnly
                },
                documents: {
                    total: totalDocsCount,
                    checkedCount: checkedDocsCount,
                    items: currentDocs
                },
                transportation: currentTransports,
                budget: { ...budgetSnapshot, totalBudget },
                packingTip: destMeta.tip,
                status: statusText,
                createdAt: new Date().toISOString()
            };
            history.unshift(snapshotTrip);
            showToast("Perjalanan berhasil disimpan ke Riwayat.");
        }

        localStorage.setItem('travelHistory', JSON.stringify(history));

        renderHistory();

        const riwayatSection = document.getElementById('riwayat');
        if (riwayatSection) {
            riwayatSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function renderHistory() {
        renderRiwayat();
    }

    function renderRiwayat() {
        if (!riwayatGrid || !riwayatEmptyState) return;
        riwayatGrid.innerHTML = '';

        const currentTripObj = JSON.parse(localStorage.getItem('currentTrip'));
        const history = JSON.parse(localStorage.getItem('travelHistory') || '[]');

        console.log("currentTrip:", currentTripObj);
        console.log("travelHistory:", history);

        if (history.length === 0) {
            riwayatEmptyState.classList.remove('hidden');
            riwayatGrid.classList.add('hidden');
            return;
        }

        riwayatEmptyState.classList.add('hidden');
        riwayatGrid.classList.remove('hidden');

        history.forEach((trip) => {
            const destMeta = defaultDestTemplates[trip.destType || 'pantai'] || defaultDestTemplates.pantai;
            const checkedCount = trip.checklist?.checkedCount || 0;
            const totalChecklist = trip.checklist?.total || 0;
            const docCount = trip.documents?.checkedCount || 0;
            const totalDocs = trip.documents?.total || 0;
            const transportCount = trip.transportation?.length || 0;
            const totalBudget = trip.budget?.totalBudget || trip.budget?.total || 0;

            const card = document.createElement('div');
            card.className = 'riwayat-card fade-up visible';
            card.innerHTML = `
                <div class="riwayat-card-header">
                    <div>
                        <h3>${destMeta.icon} ${trip.destination}</h3>
                        <span class="badge-status status-required">✓ ${trip.status || 'Persiapan Selesai'}</span>
                    </div>
                </div>
                <div class="riwayat-details">
                    <div class="detail-row">
                        <span>Tanggal & Durasi:</span>
                        <strong>${trip.dates || ''} (${trip.duration} · ${trip.people || 2} Orang)</strong>
                    </div>
                    <div class="detail-row">
                        <span>Barang Dibawa:</span>
                        <strong>${checkedCount} dari ${totalChecklist} siap</strong>
                    </div>
                    <div class="detail-row">
                        <span>Transportasi:</span>
                        <strong>✓ ${transportCount} perjalanan diatur</strong>
                    </div>
                    <div class="detail-row">
                        <span>Dokumen:</span>
                        <strong>✓ ${docCount} dari ${totalDocs} siap</strong>
                    </div>
                    <div class="detail-row">
                        <span>Estimasi Budget:</span>
                        <strong class="text-maroon">${formatRupiah(totalBudget)}</strong>
                    </div>
                </div>
                <div class="riwayat-actions">
                    <button class="btn btn-outline detail-trip-btn">Lihat Detail</button>
                    <button class="btn btn-outline edit-trip-btn">Edit</button>
                    <button class="btn btn-danger-link delete-trip-btn">Hapus</button>
                </div>
            `;

            card.querySelector('.detail-trip-btn').addEventListener('click', () => {
                showTripDetailModal(trip);
            });

            card.querySelector('.edit-trip-btn').addEventListener('click', () => {
                editTrip(trip);
            });

            card.querySelector('.delete-trip-btn').addEventListener('click', () => {
                openDeleteModal(trip.id);
            });

            riwayatGrid.appendChild(card);
        });
    }

    function editTrip(trip) {
        editingTripId = trip.id;
        activeDest = trip.destType || 'pantai';
        
        if (trip.duration.includes('1–3')) activeDuration = 'short';
        else if (trip.duration.includes('4–7')) activeDuration = 'medium';
        else activeDuration = 'long';

        if (trip.budget) {
            if (document.getElementById('bgTransport')) document.getElementById('bgTransport').value = trip.budget.bgTransport || 0;
            if (document.getElementById('bgHotel')) document.getElementById('bgHotel').value = trip.budget.bgHotel || 0;
            if (document.getElementById('bgMakan')) document.getElementById('bgMakan').value = trip.budget.bgMakan || 0;
            if (document.getElementById('bgAktivitas')) document.getElementById('bgAktivitas').value = trip.budget.bgAktivitas || 0;
            if (document.getElementById('bgLainnya')) document.getElementById('bgLainnya').value = trip.budget.bgLainnya || 0;
            calculateBudget();
        }

        if (destinationGrid) {
            const cards = destinationGrid.querySelectorAll('.dest-card');
            cards.forEach(c => {
                c.classList.remove('active');
                if (c.getAttribute('data-dest') === activeDest) c.classList.add('active');
            });
        }

        if (durationSelector) {
            const btns = durationSelector.querySelectorAll('.select-btn');
            btns.forEach(b => {
                b.classList.remove('active');
                if (b.getAttribute('data-duration') === activeDuration) b.classList.add('active');
            });
        }

        renderDestChecklist();

        const packingSec = document.getElementById('packing');
        if (packingSec) packingSec.scrollIntoView({ behavior: 'smooth' });

        showToast("Mengedit data perjalanan. Klik 'Simpan & Selesai Persiapan' setelah mengubah.");
    }

    // Delete Confirmation Modal
    const deleteTripModal = document.getElementById('deleteTripModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    function openDeleteModal(tripId) {
        deleteTargetId = tripId;
        if (deleteTripModal) deleteTripModal.classList.add('active');
    }

    if (confirmDeleteBtn && deleteTripModal && cancelDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (deleteTargetId) {
                let history = JSON.parse(localStorage.getItem('travelHistory') || '[]');
                history = history.filter(t => t.id !== deleteTargetId);
                localStorage.setItem('travelHistory', JSON.stringify(history));
                deleteTargetId = null;
                deleteTripModal.classList.remove('active');
                renderRiwayat();
                showToast("Perjalanan berhasil dihapus dari Riwayat.");
            }
        });

        cancelDeleteBtn.addEventListener('click', () => {
            deleteTargetId = null;
            deleteTripModal.classList.remove('active');
        });

        deleteTripModal.addEventListener('click', (e) => {
            if (e.target === deleteTripModal) {
                deleteTargetId = null;
                deleteTripModal.classList.remove('active');
            }
        });
    }

    /* FULL TRAVEL RECAP DETAIL MODAL HANDLER */
    const tripDetailModal = document.getElementById('tripDetailModal');
    const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
    const closeDetailModalX = document.getElementById('closeDetailModalX');

    function showTripDetailModal(trip) {
        if (!trip || !tripDetailModal) return;

        const destMeta = defaultDestTemplates[trip.destType || 'pantai'] || defaultDestTemplates.pantai;

        // Header & Meta
        document.getElementById('detailDestination').textContent = `${destMeta.icon} ${trip.destination}`;
        document.getElementById('detailStatusBadge').textContent = `✓ ${trip.status || 'Persiapan Selesai'}`;
        document.getElementById('detail3dImg').src = destMeta.img;
        document.getElementById('detailDates').textContent = `${trip.duration} (${trip.dates || ''})`;
        document.getElementById('detailPeople').textContent = `${trip.people || 2} Orang`;
        document.getElementById('detailBudget').textContent = formatRupiah(trip.budget?.totalBudget || 0);
        document.getElementById('detailDestType').textContent = `${destMeta.icon} ${destMeta.name}`;

        // 1. Checklist Items (ONLY items checked by user)
        const checkedItems = trip.checklist?.checkedOnly || (trip.checklist?.items ? trip.checklist.items.filter(i => i.checked) : []);
        const totalItemsCount = trip.checklist?.total || 0;
        const checkedItemsCount = checkedItems.length;

        document.getElementById('detailChecklistCounter').textContent = `${checkedItemsCount} dari ${totalItemsCount} barang siap`;
        const checklistPct = totalItemsCount === 0 ? 0 : Math.round((checkedItemsCount / totalItemsCount) * 100);
        document.getElementById('detailChecklistBar').style.width = `${checklistPct}%`;

        const checklistStatusEl = document.getElementById('detailChecklistStatus');
        if (checklistStatusEl) {
            checklistStatusEl.textContent = checklistPct === 100 
                ? "✓ Semua barang siap" 
                : (checkedItemsCount > 0 ? `Persiapan barang berjalan (${checklistPct}%)` : "Belum ada barang yang dicentang");
        }

        const checkedItemsContainer = document.getElementById('detailCheckedItems');
        if (checkedItemsContainer) {
            checkedItemsContainer.innerHTML = '';
            if (checkedItems.length === 0) {
                checkedItemsContainer.innerHTML = '<p class="text-muted" style="font-size: 0.85rem;">Belum ada barang yang dicentang sebagai dibawa.</p>';
            } else {
                checkedItems.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'recap-item-row';
                    div.innerHTML = `
                        <div>
                            <span class="checked-icon">✓</span>
                            <strong>${item.name}</strong>
                        </div>
                        <span class="badge-tag">${capitalize(item.category)}</span>
                    `;
                    checkedItemsContainer.appendChild(div);
                });
            }
        }

        // 2. Documents
        const docs = trip.documents?.items || [];
        const checkedDocsCount = trip.documents?.checkedCount || 0;
        const totalDocsCount = trip.documents?.total || docs.length;

        document.getElementById('detailDocsCounter').textContent = `${checkedDocsCount} dari ${totalDocsCount} dokumen siap`;
        const docsStatusEl = document.getElementById('detailDocsStatus');
        if (docsStatusEl) {
            docsStatusEl.textContent = checkedDocsCount === totalDocsCount && totalDocsCount > 0 
                ? "✓ Semua dokumen siap" 
                : "Persiapan dokumen belum selesai";
        }

        const docsContainer = document.getElementById('detailDocsList');
        if (docsContainer) {
            docsContainer.innerHTML = '';
            if (docs.length === 0) {
                docsContainer.innerHTML = '<p class="text-muted" style="font-size: 0.85rem;">Belum ada dokumen yang diatur.</p>';
            } else {
                docs.forEach(doc => {
                    const div = document.createElement('div');
                    div.className = 'recap-item-row';
                    div.innerHTML = `
                        <div>
                            <span class="checked-icon">${doc.checked ? '✓' : '☐'}</span>
                            <span style="${doc.checked ? 'font-weight: 600;' : 'color: var(--muted-text);'}">${doc.name}</span>
                        </div>
                        <span class="badge-status ${doc.checked ? 'status-required' : 'status-optional'}">${doc.checked ? 'Siap' : 'Belum'}</span>
                    `;
                    docsContainer.appendChild(div);
                });
            }

            if (db) {
                const tx = db.transaction('pdfDocuments', 'readonly');
                const store = tx.objectStore('pdfDocuments');
                const req = store.getAll();
                req.onsuccess = () => {
                    const files = req.result;
                    if (files && files.length > 0) {
                        const pdfHeader = document.createElement('div');
                        pdfHeader.className = 'margin-top-xs text-maroon font-weight-bold';
                        pdfHeader.style.fontSize = '0.85rem';
                        pdfHeader.innerHTML = '📄 Dokumen E-Ticket / PDF Tersimpan Offline:';
                        docsContainer.appendChild(pdfHeader);

                        files.forEach(f => {
                            const pdfRow = document.createElement('div');
                            pdfRow.className = 'recap-item-row margin-top-xs';
                            pdfRow.innerHTML = `
                                <div>
                                    <span class="checked-icon">📄</span>
                                    <span>${f.name} (${f.size})</span>
                                </div>
                                <button class="btn btn-outline btn-sm open-pdf-detail-btn" data-id="${f.id}">Buka PDF</button>
                            `;
                            pdfRow.querySelector('.open-pdf-detail-btn').addEventListener('click', () => {
                                openPDFBlob(f.id);
                            });
                            docsContainer.appendChild(pdfRow);
                        });
                    }
                };
            }
        }

        // 3. Transportation & Timeline
        const transports = trip.transportation || [];
        const transportListContainer = document.getElementById('detailTransportList');
        const timelineListContainer = document.getElementById('detailTimelineList');

        if (transportListContainer) {
            transportListContainer.innerHTML = '';
            if (transports.length === 0) {
                transportListContainer.innerHTML = '<p class="text-muted" style="font-size: 0.85rem;">Belum ada moda transportasi yang diatur.</p>';
            } else {
                transports.forEach(tr => {
                    const div = document.createElement('div');
                    div.className = 'recap-item-row margin-top-xs';
                    const trIcon = tr.type === 'pesawat' ? '✈️' : (tr.type === 'bus' ? '🚌' : (tr.type === 'mobil' ? '🚗' : '🚆'));
                    div.innerHTML = `
                        <div>
                            <strong>${trIcon} ${capitalize(tr.type)}</strong>: ${tr.origin} → ${tr.dest}
                            ${tr.number ? `<br><small class="text-muted">Kode/No: ${tr.number}</small>` : ''}
                        </div>
                        <div class="text-right">
                            <span class="badge-tag">Berangkat: ${tr.timeDept}</span>
                            <br><small class="text-muted">Persiapan: ${tr.timePrep}</small>
                        </div>
                    `;
                    transportListContainer.appendChild(div);
                });
            }
        }

        if (timelineListContainer) {
            timelineListContainer.innerHTML = '';
            if (transports.length === 0) {
                timelineListContainer.innerHTML = '<p class="text-muted" style="font-size: 0.85rem;">Timeline belum tersedia.</p>';
            } else {
                const sortedTr = [...transports].sort((a, b) => a.timePrep.localeCompare(b.timePrep));
                sortedTr.forEach(tr => {
                    const trIcon = tr.type === 'pesawat' ? '✈️' : (tr.type === 'bus' ? '🚌' : (tr.type === 'mobil' ? '🚗' : '🚆'));
                    const prepDiv = document.createElement('div');
                    prepDiv.className = 'timeline-item';
                    prepDiv.innerHTML = `
                        <div class="timeline-header">
                            <span class="timeline-time">⏰ Waktu Persiapan: ${tr.timePrep}</span>
                            <span class="badge-tag">Persiapan</span>
                        </div>
                        <div class="timeline-route">Persiapan barang & keberangkatan menuju ${tr.origin}</div>
                    `;

                    const deptDiv = document.createElement('div');
                    deptDiv.className = 'timeline-item';
                    deptDiv.innerHTML = `
                        <div class="timeline-header">
                            <span class="timeline-time">⏰ Jam Berangkat: ${tr.timeDept}</span>
                            <span class="badge-tag">${capitalize(tr.type)}</span>
                        </div>
                        <div class="timeline-route">${trIcon} ${tr.origin} → ${tr.dest}</div>
                        ${tr.number ? `<div class="timeline-notes">Kode: ${tr.number}</div>` : ''}
                    `;

                    timelineListContainer.appendChild(prepDiv);
                    timelineListContainer.appendChild(deptDiv);
                });
            }
        }

        // 4. Budget Breakdown
        const budgetObj = trip.budget || { bgTransport: 0, bgHotel: 0, bgMakan: 0, bgAktivitas: 0, bgLainnya: 0, totalBudget: 0 };
        const budgetContainer = document.getElementById('detailBudgetBreakdown');
        if (budgetContainer) {
            budgetContainer.innerHTML = `
                <div class="detail-budget-item"><span>Transportasi</span><strong>${formatRupiah(budgetObj.bgTransport || 0)}</strong></div>
                <div class="detail-budget-item"><span>Hotel / Akomodasi</span><strong>${formatRupiah(budgetObj.bgHotel || 0)}</strong></div>
                <div class="detail-budget-item"><span>Makan & Minum</span><strong>${formatRupiah(budgetObj.bgMakan || 0)}</strong></div>
                <div class="detail-budget-item"><span>Aktivitas & Wisata</span><strong>${formatRupiah(budgetObj.bgAktivitas || 0)}</strong></div>
                <div class="detail-budget-item"><span>Lainnya / Cadangan</span><strong>${formatRupiah(budgetObj.bgLainnya || 0)}</strong></div>
            `;
        }
        if (document.getElementById('detailTotalBudgetDisplay')) {
            document.getElementById('detailTotalBudgetDisplay').textContent = formatRupiah(budgetObj.totalBudget || 0);
        }

        // 5. Packing Tips
        if (document.getElementById('detailPackingTipText')) {
            document.getElementById('detailPackingTipText').textContent = trip.packingTip || destMeta.tip;
        }

        tripDetailModal.classList.add('active');
    }

    if (closeDetailModalBtn && closeDetailModalX && tripDetailModal) {
        closeDetailModalBtn.addEventListener('click', () => tripDetailModal.classList.remove('active'));
        closeDetailModalX.addEventListener('click', () => tripDetailModal.classList.remove('active'));
        tripDetailModal.addEventListener('click', (e) => {
            if (e.target === tripDetailModal) tripDetailModal.classList.remove('active');
        });
    }

    renderHistory();

    /* ==========================================================================
       7. PLAN YOUR NEXT TRIP FEATURE (ISOLATED IN `nextTripPlans`) - OPTIONAL
       ========================================================================== */
    const submitPlannerBtn = document.getElementById('submitPlannerBtn');
    const nextPlansContainer = document.getElementById('nextPlansContainer');
    const nextPlansGrid = document.getElementById('nextPlansGrid');

    function renderNextPlans() {
        if (!nextPlansContainer || !nextPlansGrid) return;
        const plans = JSON.parse(localStorage.getItem('nextTripPlans') || '[]');

        if (plans.length === 0) {
            nextPlansContainer.classList.add('hidden');
            return;
        }

        nextPlansContainer.classList.remove('hidden');
        nextPlansGrid.innerHTML = '';

        plans.forEach((plan, idx) => {
            const card = document.createElement('div');
            card.className = 'riwayat-card fade-up';
            card.innerHTML = `
                <div class="riwayat-card-header">
                    <div>
                        <h3>${plan.destination}</h3>
                        <span class="badge-status status-optional">Rencana Berikutnya</span>
                    </div>
                </div>
                <div class="riwayat-details">
                    <div class="detail-row">
                        <span>Tanggal:</span>
                        <strong>${plan.dates} (${plan.duration})</strong>
                    </div>
                    <div class="detail-row">
                        <span>Rombongan:</span>
                        <strong>${plan.people} Orang</strong>
                    </div>
                    ${plan.notes ? `<div class="detail-row"><span>Catatan:</span><strong>${plan.notes}</strong></div>` : ''}
                </div>
                <div class="text-right">
                    <button class="btn btn-danger-link delete-next-plan-btn" data-idx="${idx}">Hapus Rencana</button>
                </div>
            `;

            card.querySelector('.delete-next-plan-btn').addEventListener('click', () => {
                plans.splice(idx, 1);
                localStorage.setItem('nextTripPlans', JSON.stringify(plans));
                renderNextPlans();
                showToast("Rencana perjalanan dihapus.");
            });

            nextPlansGrid.appendChild(card);
        });
    }

    if (submitPlannerBtn) {
        submitPlannerBtn.addEventListener('click', () => {
            const destination = document.getElementById('planDestination').value.trim();
            const startDate = document.getElementById('planStartDate').value;
            const endDate = document.getElementById('planEndDate').value;
            const people = parseInt(document.getElementById('planPeople').value) || 1;
            const notes = document.getElementById('planNotes')?.value.trim() || '';

            if (!destination) {
                showToast("Harap isi tujuan perjalanan.");
                return;
            }

            if (!startDate || !endDate) {
                showToast("Harap isi tanggal berangkat dan pulang.");
                return;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end < start) {
                showToast("Tanggal pulang tidak boleh sebelum berangkat.");
                return;
            }

            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            const formattedStart = start.toLocaleDateString('id-ID', options);
            const formattedEnd = end.toLocaleDateString('id-ID', options);

            const nextPlan = {
                id: Date.now(),
                destination: destination,
                dates: `${formattedStart} - ${formattedEnd}`,
                duration: `${diffDays} Hari`,
                people: people,
                notes: notes,
                status: "Rencana Berikutnya",
                createdAt: new Date().toISOString()
            };

            const plans = JSON.parse(localStorage.getItem('nextTripPlans') || '[]');
            plans.unshift(nextPlan);
            localStorage.setItem('nextTripPlans', JSON.stringify(plans));
            renderNextPlans();

            showToast("Rencana perjalanan berhasil disimpan.");
        });
    }

    renderNextPlans();

    /* ==========================================================================
       8. SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => observer.observe(el));

    /* ==========================================================================
       9. UTILITY FUNCTIONS
       ========================================================================== */
    function showToast(message) {
        const toast = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');

        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

});
