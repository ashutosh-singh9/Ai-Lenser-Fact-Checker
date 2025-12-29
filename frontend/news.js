/**
 * AI LENSER - News Page JavaScript
 * Trending Fact-Checked Headlines
 */

// Sample news data (in production, fetch from API)
const newsData = [
    {
        id: 1,
        category: "politics",
        title: "Government Announces New Digital India Initiative",
        description: "The Ministry of Electronics and IT unveiled a comprehensive plan to expand digital infrastructure across rural areas, aiming to connect 500,000 villages by 2026.",
        source: "PIB India",
        time: "2h ago",
        status: "verified",
        featured: true
    },
    {
        id: 2,
        category: "health",
        title: "WHO Issues New Guidelines on Air Quality Standards",
        description: "World Health Organization releases updated recommendations for indoor and outdoor air quality, emphasizing stricter limits on PM2.5 particles.",
        source: "WHO",
        time: "3h ago",
        status: "verified"
    },
    {
        id: 3,
        category: "technology",
        title: "Viral Claim: 5G Towers Cause Health Issues - DEBUNKED",
        description: "Multiple fact-checkers have conclusively debunked claims circulating on social media about 5G technology causing health problems. Scientific evidence shows no harmful effects.",
        source: "AltNews",
        time: "4h ago",
        status: "fake"
    },
    {
        id: 4,
        category: "world",
        title: "Global Climate Summit Reaches Historic Agreement",
        description: "195 nations have signed a binding agreement to reduce carbon emissions by 50% within the next decade, marking the most ambitious climate deal in history.",
        source: "WorldNews",
        time: "5h ago",
        status: "verified"
    },
    {
        id: 5,
        category: "science",
        title: "ISRO's Chandrayaan-4 Mission Gets Cabinet Approval",
        description: "Indian Space Research Organisation receives green light for ambitious lunar exploration mission, including sample return capability.",
        source: "ISRO",
        time: "6h ago",
        status: "verified"
    },
    {
        id: 6,
        category: "finance",
        title: "RBI Maintains Repo Rate for Fourth Consecutive Time",
        description: "Reserve Bank of India holds benchmark lending rate steady at 6.5%, citing balanced inflation outlook and need to support economic growth.",
        source: "RBI",
        time: "7h ago",
        status: "verified"
    },
    {
        id: 7,
        category: "health",
        title: "False: Drinking Hot Water Cures COVID-19",
        description: "Viral WhatsApp message claiming hot water consumption kills coronavirus is completely false. WHO and medical experts confirm there is no cure through drinking hot water.",
        source: "BoomLive",
        time: "8h ago",
        status: "fake"
    },
    {
        id: 8,
        category: "politics",
        title: "Parliament Passes Historic Education Reform Bill",
        description: "Lok Sabha and Rajya Sabha approve comprehensive reform package aimed at modernizing curriculum and improving teacher training programs nationwide.",
        source: "Parliament",
        time: "9h ago",
        status: "verified"
    },
    {
        id: 9,
        category: "technology",
        title: "India's First Quantum Computing Research Center Launched",
        description: "Scientists have achieved a major breakthrough in qubit stability, paving the way for commercial quantum computers by 2030.",
        source: "TechDaily",
        time: "10h ago",
        status: "verified"
    },
    {
        id: 10,
        category: "world",
        title: "Fake: NASA Announces End of World Next Week",
        description: "Hoax message claiming NASA confirmed asteroid impact has been debunked. NASA's planetary defense team confirms no known asteroid threat in the foreseeable future.",
        source: "FactChecker",
        time: "11h ago",
        status: "fake"
    },
    {
        id: 11,
        category: "finance",
        title: "Stock Market Reaches Record High on Positive Outlook",
        description: "BSE Sensex and Nifty 50 close at all-time highs as foreign institutional investors increase stake in Indian equities amid global economic optimism.",
        source: "EconomicTimes",
        time: "12h ago",
        status: "verified"
    },
    {
        id: 12,
        category: "science",
        title: "Scientists Discover New Species in Western Ghats",
        description: "Researchers from IISc Bangalore identify three previously unknown amphibian species in the biodiversity hotspot, highlighting conservation importance.",
        source: "Nature India",
        time: "1d ago",
        status: "verified"
    }
];

// DOM Elements
const newsGrid = document.getElementById('newsGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');

// State
let currentFilter = 'all';
let searchQuery = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFilters();
    initSearch();
    loadNews();
});

// Theme
function initTheme() {
    const savedTheme = localStorage.getItem('ailenser-theme') || 'dark';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('ailenser-theme', isDark ? 'dark' : 'light');
    });
}

// Filters
function initFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderNews();
        });
    });
}

// Search
function initSearch() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderNews();
    });
}

// Load News
function loadNews() {
    // Simulate loading delay
    setTimeout(() => {
        loadingState.style.display = 'none';
        renderNews();
    }, 500);
}

// Filter and render news
function renderNews() {
    let filtered = newsData;

    // Apply category filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'verified' || currentFilter === 'fake') {
            filtered = filtered.filter(item => item.status === currentFilter);
        } else {
            filtered = filtered.filter(item => item.category === currentFilter);
        }
    }

    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery) ||
            item.source.toLowerCase().includes(searchQuery)
        );
    }

    // Render
    if (filtered.length === 0) {
        newsGrid.innerHTML = '';
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        newsGrid.innerHTML = filtered.map(item => createNewsCard(item)).join('');
    }
}

// Create news card HTML
function createNewsCard(item) {
    const statusIcon = item.status === 'verified'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';

    const statusText = item.status === 'verified' ? 'Verified' : 'Debunked';

    return `
        <article class="news-card ${item.featured ? 'featured' : ''}" style="--card-accent: var(--cat-${item.category})" onclick="openNews(${item.id})">
            <span class="card-category ${item.category}">${item.category}</span>
            <span class="card-status ${item.status}">
                ${statusIcon}
                ${statusText}
            </span>
            <h2 class="card-title">${item.title}</h2>
            <p class="card-description">${item.description}</p>
            <div class="card-meta">
                <span class="card-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    ${item.time}
                </span>
                <span class="card-source">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    ${item.source}
                </span>
            </div>
        </article>
    `;
}

// Open news detail (could navigate to detail page or show modal)
function openNews(id) {
    const news = newsData.find(item => item.id === id);
    if (news) {
        // For now, just copy to clipboard and alert
        const text = `${news.title}\n\n${news.description}\n\nSource: ${news.source}\nStatus: ${news.status === 'verified' ? '✓ Verified' : '✗ Debunked'}`;
        navigator.clipboard.writeText(text).then(() => {
            alert(`News copied to clipboard!\n\n${news.status === 'verified' ? '✓ This news is VERIFIED' : '⚠️ This news has been DEBUNKED'}`);
        });
    }
}
