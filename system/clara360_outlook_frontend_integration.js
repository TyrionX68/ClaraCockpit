// Clara360 Outlook Frontend Integration v1.0
// Erweitert bestehende UI um echte Outlook-Funktionalität
(function() {
    'use strict';
    
    console.log('📧 Clara360 Outlook Frontend Integration v1.0 wird geladen...');
    
    // API Configuration
    const OUTLOOK_API = {
        baseUrl: 'http://localhost:3002/api',
        endpoints: {
            health: '/health',
            users: '/users',
            emails: '/users/{userId}/emails',
            sendEmail: '/users/{userId}/send-email',
            unreadCount: '/clara360/unread-count',
            recentEmails: '/clara360/recent-emails'
        }
    };
    
    // State Management
    let outlookState = {
        connected: false,
        users: [],
        currentUser: null,
        emails: [],
        unreadCount: 0,
        lastSync: null
    };
    
    // Utility Functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffHours < 1) return 'Gerade eben';
        if (diffHours < 24) return `vor ${diffHours}h`;
        if (diffDays < 7) return `vor ${diffDays}d`;
        return date.toLocaleDateString('de-DE');
    }
    
    function truncateText(text, maxLength = 100) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // API Functions
    async function checkOutlookConnection() {
        try {
            const response = await fetch(`${OUTLOOK_API.baseUrl}${OUTLOOK_API.endpoints.health}`);
            const data = await response.json();
            outlookState.connected = data.status === 'healthy';
            console.log('✅ Outlook-Verbindung:', outlookState.connected ? 'Aktiv' : 'Inaktiv');
            return outlookState.connected;
        } catch (error) {
            console.error('❌ Outlook-Verbindung fehlgeschlagen:', error);
            outlookState.connected = false;
            return false;
        }
    }
    
    async function loadUsers() {
        try {
            const response = await fetch(`${OUTLOOK_API.baseUrl}${OUTLOOK_API.endpoints.users}`);
            const data = await response.json();
            
            if (data.success) {
                outlookState.users = data.users;
                if (data.users.length > 0 && !outlookState.currentUser) {
                    outlookState.currentUser = data.users[0];
                }
                console.log('✅ Benutzer geladen:', data.users.length);
                return data.users;
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der Benutzer:', error);
        }
        return [];
    }
    
    async function loadEmails(userId = null, options = {}) {
        try {
            const user = userId || outlookState.currentUser?.id;
            if (!user) return [];
            
            const url = `${OUTLOOK_API.baseUrl}${OUTLOOK_API.endpoints.emails.replace('{userId}', user)}`;
            const params = new URLSearchParams();
            
            if (options.unreadOnly) params.append('unreadOnly', 'true');
            if (options.top) params.append('top', options.top);
            
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            
            if (data.success) {
                outlookState.emails = data.emails;
                outlookState.lastSync = new Date();
                console.log('✅ E-Mails geladen:', data.emails.length);
                return data.emails;
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der E-Mails:', error);
        }
        return [];
    }
    
    async function getUnreadCount() {
        try {
            const response = await fetch(`${OUTLOOK_API.baseUrl}${OUTLOOK_API.endpoints.unreadCount}`);
            const data = await response.json();
            
            if (data.success) {
                outlookState.unreadCount = data.totalUnread;
                return data.totalUnread;
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der ungelesenen E-Mails:', error);
        }
        return 0;
    }
    
    async function sendEmail(emailData) {
        try {
            const user = outlookState.currentUser?.id;
            if (!user) throw new Error('Kein Benutzer ausgewählt');
            
            const url = `${OUTLOOK_API.baseUrl}${OUTLOOK_API.endpoints.sendEmail.replace('{userId}', user)}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ E-Mail gesendet');
                return true;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Fehler beim Senden der E-Mail:', error);
            throw error;
        }
    }
    
    // UI Enhancement Functions
    function enhanceOutlookPage() {
        console.log('🔧 Erweitere Outlook-Seite mit echter Funktionalität...');
        
        // Warte auf Outlook-Seite
        const outlookPageCheck = setInterval(() => {
            if (window.location.pathname.includes('outlook') || 
                document.querySelector('[data-page="outlook"]') ||
                document.querySelector('.outlook-page')) {
                
                clearInterval(outlookPageCheck);
                initializeOutlookPage();
            }
        }, 1000);
    }
    
    function initializeOutlookPage() {
        console.log('📧 Initialisiere Outlook-Seite...');
        
        // Verbindungsstatus anzeigen
        updateConnectionStatus();
        
        // E-Mail-Liste laden
        loadAndDisplayEmails();
        
        // Ungelesene E-Mails Badge aktualisieren
        updateUnreadBadge();
        
        // Event Listeners für bestehende UI-Elemente
        setupEventListeners();
        
        // Auto-Refresh alle 30 Sekunden
        setInterval(() => {
            if (window.location.pathname.includes('outlook')) {
                loadAndDisplayEmails();
                updateUnreadBadge();
            }
        }, 30000);
    }
    
    function updateConnectionStatus() {
        const statusElements = document.querySelectorAll('.outlook-connection-status, [data-outlook-status]');
        
        statusElements.forEach(element => {
            if (outlookState.connected) {
                element.innerHTML = `
                    <div class="flex items-center text-green-600">
                        <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span class="text-sm font-medium">Outlook verbunden</span>
                    </div>
                `;
                element.className = element.className.replace(/bg-red-\d+/, 'bg-green-50');
            } else {
                element.innerHTML = `
                    <div class="flex items-center text-red-600">
                        <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span class="text-sm font-medium">Outlook nicht verbunden</span>
                    </div>
                `;
                element.className = element.className.replace(/bg-green-\d+/, 'bg-red-50');
            }
        });
    }
    
    function loadAndDisplayEmails() {
        if (!outlookState.connected) return;
        
        loadEmails().then(emails => {
            displayEmailList(emails);
        });
    }
    
    function displayEmailList(emails) {
        const emailContainers = document.querySelectorAll('.email-list, [data-email-list]');
        
        emailContainers.forEach(container => {
            if (emails.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-4">📭</div>
                        <p>Keine E-Mails gefunden</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = emails.map(email => `
                <div class="email-item border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer ${!email.isRead ? 'bg-blue-50' : ''}" 
                     data-email-id="${email.id}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                ${!email.isRead ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
                                <span class="text-sm font-medium text-gray-900 truncate">
                                    ${email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unbekannt'}
                                </span>
                                <span class="text-xs text-gray-500">${formatDate(email.receivedDateTime)}</span>
                            </div>
                            <h3 class="text-sm font-medium text-gray-900 truncate mb-1">
                                ${email.subject || '(Kein Betreff)'}
                            </h3>
                            <p class="text-sm text-gray-600 truncate">
                                ${truncateText(email.bodyPreview)}
                            </p>
                        </div>
                        <div class="flex items-center space-x-2 ml-4">
                            ${email.hasAttachments ? '<div class="w-4 h-4 text-gray-400">📎</div>' : ''}
                            <button class="text-blue-600 hover:text-blue-800 text-xs" onclick="openEmail('${email.id}')">
                                Öffnen
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }
    
    function updateUnreadBadge() {
        getUnreadCount().then(count => {
            const badges = document.querySelectorAll('.unread-badge, [data-unread-badge]');
            
            badges.forEach(badge => {
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'inline-flex';
                    badge.className = badge.className.replace(/hidden/, '');
                } else {
                    badge.style.display = 'none';
                    badge.className += ' hidden';
                }
            });
            
            // Sidebar-Badge aktualisieren
            const sidebarOutlookLink = document.querySelector('a[href*="outlook"]');
            if (sidebarOutlookLink && count > 0) {
                let existingBadge = sidebarOutlookLink.querySelector('.sidebar-unread-badge');
                if (!existingBadge) {
                    existingBadge = document.createElement('span');
                    existingBadge.className = 'sidebar-unread-badge bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2';
                    sidebarOutlookLink.appendChild(existingBadge);
                }
                existingBadge.textContent = count;
            } else if (sidebarOutlookLink) {
                const existingBadge = sidebarOutlookLink.querySelector('.sidebar-unread-badge');
                if (existingBadge) {
                    existingBadge.remove();
                }
            }
        });
    }
    
    function setupEventListeners() {
        // E-Mail senden Button
        const sendButtons = document.querySelectorAll('.send-email-btn, [data-send-email]');
        sendButtons.forEach(button => {
            button.addEventListener('click', openComposeModal);
        });
        
        // Aktualisieren Button
        const refreshButtons = document.querySelectorAll('.refresh-emails-btn, [data-refresh-emails]');
        refreshButtons.forEach(button => {
            button.addEventListener('click', () => {
                loadAndDisplayEmails();
                updateUnreadBadge();
            });
        });
    }
    
    function openComposeModal() {
        // Erstelle Compose-Modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Neue E-Mail</h3>
                    <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form id="compose-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">An:</label>
                        <input type="email" id="email-to" class="w-full border border-gray-300 rounded-md px-3 py-2" 
                               placeholder="empfaenger@example.com" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Betreff:</label>
                        <input type="text" id="email-subject" class="w-full border border-gray-300 rounded-md px-3 py-2" 
                               placeholder="E-Mail Betreff" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nachricht:</label>
                        <textarea id="email-body" rows="8" class="w-full border border-gray-300 rounded-md px-3 py-2" 
                                  placeholder="Ihre Nachricht..." required></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                onclick="this.closest('.fixed').remove()">
                            Abbrechen
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Senden
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Form Submit Handler
        document.getElementById('compose-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailData = {
                to: [document.getElementById('email-to').value],
                subject: document.getElementById('email-subject').value,
                body: document.getElementById('email-body').value.replace(/\n/g, '<br>'),
                bodyType: 'HTML'
            };
            
            try {
                await sendEmail(emailData);
                modal.remove();
                alert('E-Mail erfolgreich gesendet!');
                loadAndDisplayEmails(); // Refresh email list
            } catch (error) {
                alert('Fehler beim Senden der E-Mail: ' + error.message);
            }
        });
    }
    
    // Global Functions (für onclick-Handler)
    window.openEmail = function(emailId) {
        console.log('📧 Öffne E-Mail:', emailId);
        // Hier könnte eine detaillierte E-Mail-Ansicht implementiert werden
        alert('E-Mail-Details werden in einer zukünftigen Version verfügbar sein.');
    };
    
    // Initialization
    async function initializeOutlookIntegration() {
        console.log('🚀 Initialisiere Outlook-Integration...');
        
        // Verbindung prüfen
        await checkOutlookConnection();
        
        if (outlookState.connected) {
            // Benutzer laden
            await loadUsers();
            
            // UI erweitern
            enhanceOutlookPage();
            
            console.log('✅ Outlook-Integration erfolgreich initialisiert');
        } else {
            console.log('❌ Outlook-Integration nicht verfügbar - Backend nicht erreichbar');
        }
    }
    
    // Auto-Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOutlookIntegration);
    } else {
        initializeOutlookIntegration();
    }
    
    // Export für Debugging
    window.ClaraOutlook = {
        state: outlookState,
        api: OUTLOOK_API,
        functions: {
            checkConnection: checkOutlookConnection,
            loadUsers: loadUsers,
            loadEmails: loadEmails,
            sendEmail: sendEmail,
            getUnreadCount: getUnreadCount
        }
    };
    
})();

console.log('✅ Clara360 Outlook Frontend Integration v1.0 geladen');

