// Widget module
// Handles UI creation, updates, and user interactions

function createFloatingUI() {
    const container = document.createElement('div');
    container.id = 'fabric-analysis-container';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-label', 'Fabric composition analysis');
    container.setAttribute('tabindex', '0');

    const header = document.createElement('div');
    header.className = 'fabric-analysis-header';
    header.style.cursor = 'grab';

    const title = document.createElement('h2');
    title.className = 'fabric-analysis-title';
    title.textContent = 'Fabric Analysis';

    const infoIcon = document.createElement('button');
    infoIcon.innerHTML = 'ⓘ';
    infoIcon.setAttribute('aria-label', 'Information about beta version');
    infoIcon.style.cssText = 'background: none; border: none; color: white; cursor: pointer; font-size: 14px; margin-left: 8px; padding: 2px; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; opacity: 0.8; transition: opacity 0.2s;';
    infoIcon.onmouseenter = () => infoIcon.style.opacity = '1';
    infoIcon.onmouseleave = () => infoIcon.style.opacity = '0.8';
    infoIcon.onclick = () => showBetaInfo();

    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'minimize-button';
    minimizeBtn.innerHTML = '−';
    minimizeBtn.setAttribute('aria-label', 'Minimize widget');
    minimizeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px 8px; opacity: 0.8; transition: opacity 0.2s; line-height: 1; margin-left: auto;';
    minimizeBtn.onclick = () => toggleMinimize();

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-button';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close widget');
    closeBtn.onclick = () => container.remove();

    header.appendChild(title);
    header.appendChild(infoIcon);
    header.appendChild(minimizeBtn);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Add bug report section
    const bugReportSection = document.createElement('div');
    bugReportSection.className = 'bug-report-section';

    const bugReportText = document.createElement('p');
    bugReportText.textContent = 'Encountered a problem? ';
    bugReportText.className = 'bug-report-text';

    const reportLink = document.createElement('button');
    reportLink.textContent = 'Report Issue';
    reportLink.className = 'report-issue-link';
    reportLink.setAttribute('aria-label', 'Report an issue with the analysis');
    reportLink.style.cssText = 'background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; margin: 0 4px 0 0; font: inherit;';
    reportLink.onclick = () => showBugReportForm();

    const emailButton = document.createElement('button');
    emailButton.textContent = 'Email Us';
    emailButton.className = 'email-button';
    emailButton.setAttribute('aria-label', 'Send email to support');
    emailButton.style.cssText = 'background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; margin: 0; font: inherit;';
    emailButton.onclick = () => window.open('mailto:fabricompositionanalysis@gmail.com');

    bugReportText.appendChild(reportLink);
    bugReportText.appendChild(document.createTextNode('or '));
    bugReportText.appendChild(emailButton);
    bugReportSection.appendChild(bugReportText);
    container.appendChild(bugReportSection);

    // Add disclaimer footer
    container.appendChild(createDisclaimerFooter());

    // Add drag functionality with touch support and boundary constraints
    setupDragBehavior(container, header, closeBtn, minimizeBtn);

    // Load saved position from localStorage
    loadWidgetPosition(container);

    // Load minimized state from localStorage
    const hostname = window.location.hostname.replace('www.', '');
    const minimizedState = localStorage.getItem(`fabric-widget-minimized-${hostname}`);
    if (minimizedState === 'true') {
        container.classList.add('minimized');
        minimizeBtn.innerHTML = '+';
        minimizeBtn.setAttribute('aria-label', 'Expand widget');
    }

    // Add keyboard navigation support
    setupKeyboardNavigation(container);

    document.body.appendChild(container);
    return container;
}

function setupDragBehavior(container, header, closeBtn, minimizeBtn) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    function handleDragStart(e) {
        // Don't drag when clicking buttons
        if (e.target === closeBtn || e.target === minimizeBtn) return;

        isDragging = true;

        // Handle both mouse and touch events
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        const rect = container.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        header.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function handleDragMove(e) {
        if (!isDragging) return;

        // Handle both mouse and touch events
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;

        // Apply boundary constraints
        const rect = container.getBoundingClientRect();
        const maxLeft = window.innerWidth - rect.width;
        const maxTop = window.innerHeight - rect.height;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
        container.style.right = 'auto';
    }

    function handleDragEnd() {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';

            // Save position to localStorage
            saveWidgetPosition(container);
        }
    }

    // Mouse events
    header.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    // Touch events
    header.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
}

function saveWidgetPosition(container) {
    const rect = container.getBoundingClientRect();
    const position = {
        left: rect.left,
        top: rect.top
    };
    localStorage.setItem('fabric-widget-position', JSON.stringify(position));
}

function loadWidgetPosition(container) {
    const savedPosition = localStorage.getItem('fabric-widget-position');
    if (savedPosition) {
        try {
            const position = JSON.parse(savedPosition);

            // Validate the position is still within viewport
            const maxLeft = window.innerWidth - 200; // min widget width
            const maxTop = window.innerHeight - 100; // min widget height

            if (position.left >= 0 && position.left <= maxLeft &&
                position.top >= 0 && position.top <= maxTop) {
                container.style.left = position.left + 'px';
                container.style.top = position.top + 'px';
                container.style.right = 'auto';
            }
        } catch (e) {
            console.error('Failed to load widget position:', e);
        }
    }
}

function toggleMinimize() {
    const container = document.getElementById('fabric-analysis-container');
    const minimizeBtn = container.querySelector('.minimize-button');

    container.classList.toggle('minimized');

    const isMinimized = container.classList.contains('minimized');
    minimizeBtn.innerHTML = isMinimized ? '+' : '−';
    minimizeBtn.setAttribute('aria-label', isMinimized ? 'Expand widget' : 'Minimize widget');

    // Save minimize state to localStorage per domain
    const hostname = window.location.hostname.replace('www.', '');
    localStorage.setItem(`fabric-widget-minimized-${hostname}`, isMinimized);
}

function setupKeyboardNavigation(container) {
    // Add Escape key to close widget
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const widget = document.getElementById('fabric-analysis-container');
            if (widget) {
                widget.remove();
            }
        }
    });
}

function updateFloatingUI(compositions) {
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;

    // Calculate sustainability score
    const finalScore = window.calculateScore(compositions);

    // Set container score attribute for styling
    container.setAttribute('data-score', window.getColorForScore(finalScore));

    // Create composition details section
    const details = document.createElement('div');
    details.className = 'composition-details';

    // Group materials by component (MAIN FABRIC, POCKET LINING, etc.)
    const mainComponents = new Map();
    compositions.forEach(section => {
        const componentName = section.component || 'MAIN FABRIC';
        if (!mainComponents.has(componentName)) {
            mainComponents.set(componentName, []);
        }
        mainComponents.get(componentName).push({
            text: section.text
        });
    });

    // Add each component section with semantic HTML
    const componentList = document.createElement('div');
    componentList.setAttribute('role', 'list');

    mainComponents.forEach((items, mainComponent) => {
        const componentSection = document.createElement('div');
        componentSection.className = 'component-section';
        componentSection.setAttribute('role', 'listitem');

        const mainTitle = document.createElement('h3');
        mainTitle.textContent = mainComponent;
        componentSection.appendChild(mainTitle);

        const materialsList = document.createElement('div');
        materialsList.setAttribute('role', 'list');

        items.forEach(item => {
            // Add materials
            const parts = item.text.split(/\s+(?=\d+%)/);
            parts.forEach(part => {
                const [percentage, ...materialParts] = part.split(/\s+/);
                const material = materialParts.join(' ');

                const materialDiv = document.createElement('div');
                materialDiv.className = 'material-item';
                materialDiv.setAttribute('role', 'listitem');

                const materialInfo = window.matchMaterialInfo(material);

                if (materialInfo) {
                    materialDiv.setAttribute('data-category', materialInfo[1].category);
                }

                materialDiv.textContent = `${percentage} ${material}`;
                materialsList.appendChild(materialDiv);
            });
        });

        componentSection.appendChild(materialsList);
        componentList.appendChild(componentSection);
    });

    details.appendChild(componentList);

    // Add sustainability score with aria-live for screen readers
    const scoreSection = document.createElement('div');
    scoreSection.className = 'sustainability-score';
    scoreSection.setAttribute('aria-live', 'polite');

    const scoreValue = document.createElement('h3');
    scoreValue.textContent = `${finalScore}/10`;
    scoreSection.appendChild(scoreValue);

    // Get existing header
    const header = container.querySelector('.fabric-analysis-header');

    // Update container content while preserving header
    const wasMinimized = container.classList.contains('minimized');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(details);
    container.appendChild(scoreSection);

    // Add bug report section
    const bugReportSection = document.createElement('div');
    bugReportSection.className = 'bug-report-section';

    const bugReportText = document.createElement('p');
    bugReportText.textContent = 'Encountered a problem? ';
    bugReportText.className = 'bug-report-text';

    const reportLink = document.createElement('button');
    reportLink.textContent = 'Report Issue';
    reportLink.className = 'report-issue-link';
    reportLink.setAttribute('aria-label', 'Report an issue with the analysis');
    reportLink.style.cssText = 'background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; margin: 0 4px 0 0; font: inherit;';
    reportLink.onclick = () => showBugReportForm();

    const emailButton = document.createElement('button');
    emailButton.textContent = 'Email Us';
    emailButton.className = 'email-button';
    emailButton.setAttribute('aria-label', 'Send email to support');
    emailButton.style.cssText = 'background: none; border: none; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; margin: 0; font: inherit;';
    emailButton.onclick = () => window.open('mailto:fabricompositionanalysis@gmail.com');

    bugReportText.appendChild(reportLink);
    bugReportText.appendChild(document.createTextNode('or '));
    bugReportText.appendChild(emailButton);
    bugReportSection.appendChild(bugReportText);
    container.appendChild(bugReportSection);

    // Add disclaimer footer
    container.appendChild(createDisclaimerFooter());

    if (wasMinimized) {
        container.classList.add('minimized');
    }
}

function showNoCompositionUI() {
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;

    const header = container.querySelector('.fabric-analysis-header');

    // Create no composition message with contextual information
    const noCompositionSection = document.createElement('div');
    noCompositionSection.className = 'no-composition-section';

    const siteConfig = window.getCurrentSiteConfig();
    const siteName = window.location.hostname.replace('www.', '');

    const noCompositionTitle = document.createElement('h3');
    noCompositionTitle.textContent = 'No Composition Found';
    noCompositionTitle.style.cssText = 'margin: 0 0 10px 0; color: #333;';

    const noCompositionText = document.createElement('p');
    noCompositionText.className = 'no-composition-text';
    noCompositionText.innerHTML = `No fabric composition information was found on this page.<br><br>
        <strong>Site:</strong> ${siteName}<br>
        <strong>Parser:</strong> ${siteConfig === window.siteConfig.default ? 'Default' : 'Site-specific'}<br><br>
        This page may not contain fabric details, or the site layout may have changed.`;

    const retryButton = document.createElement('button');
    retryButton.textContent = 'Try Again';
    retryButton.className = 'retry-button';
    retryButton.style.cssText = 'margin-top: 12px; padding: 8px 16px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;';
    retryButton.onclick = () => {
        container.remove();
        window.location.reload();
    };

    noCompositionSection.appendChild(noCompositionTitle);
    noCompositionSection.appendChild(noCompositionText);
    noCompositionSection.appendChild(retryButton);

    // Update container content while preserving header and bug report section
    const bugReportSection = container.querySelector('.bug-report-section');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(noCompositionSection);
    if (bugReportSection) {
        container.appendChild(bugReportSection);
    }
    container.appendChild(createDisclaimerFooter());
}

function showErrorUI(error) {
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;

    const header = container.querySelector('.fabric-analysis-header');

    // Create error message with better UX
    const errorSection = document.createElement('div');
    errorSection.className = 'error-section';

    const errorTitle = document.createElement('h3');
    errorTitle.textContent = 'Analysis Error';
    errorTitle.style.cssText = 'margin: 0 0 10px 0; color: #c62828;';

    const errorText = document.createElement('p');
    errorText.className = 'error-text';

    // Categorize error type
    let errorMessage = 'An error occurred while analyzing this page.';
    if (error.message && error.message.includes('not loaded')) {
        errorMessage = 'The page is still loading. Please wait a moment and try again.';
    } else if (error.message && error.message.includes('product page')) {
        errorMessage = 'This doesn\'t appear to be a product page.';
    }

    errorText.textContent = errorMessage;

    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.className = 'retry-button';
    retryButton.style.cssText = 'margin-top: 12px; padding: 8px 16px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;';
    retryButton.onclick = () => {
        container.remove();
        setTimeout(() => window.init(), 500);
    };

    errorSection.appendChild(errorTitle);
    errorSection.appendChild(errorText);
    errorSection.appendChild(retryButton);

    // Update container content while preserving header and bug report section
    const bugReportSection = container.querySelector('.bug-report-section');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(errorSection);
    if (bugReportSection) {
        container.appendChild(bugReportSection);
    }
    container.appendChild(createDisclaimerFooter());
}

function showLoadingUI() {
    const container = document.getElementById('fabric-analysis-container');
    if (!container) return;

    const header = container.querySelector('.fabric-analysis-header');

    const loadingSection = document.createElement('div');
    loadingSection.className = 'loading-section';
    loadingSection.style.cssText = 'padding: 30px 12px; text-align: center; background: rgba(255, 255, 255, 0.95);';

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.cssText = 'width: 30px; height: 30px; border: 3px solid rgba(46, 125, 50, 0.2); border-top-color: #2e7d32; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px;';

    // Add spinner animation to page if not already present
    if (!document.getElementById('spinner-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframes';
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }

    const loadingText = document.createElement('p');
    loadingText.textContent = 'Analyzing fabric composition...';
    loadingText.style.cssText = 'margin: 0; color: #666; font-size: 13px;';

    loadingSection.appendChild(spinner);
    loadingSection.appendChild(loadingText);

    const bugReportSection = container.querySelector('.bug-report-section');
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(loadingSection);
    if (bugReportSection) {
        container.appendChild(bugReportSection);
    }
    container.appendChild(createDisclaimerFooter());
}

function showBetaInfo() {
    const modal = document.createElement('div');
    modal.className = 'beta-info-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'beta-modal-title');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';

    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 400px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';

    const title = document.createElement('h3');
    title.id = 'beta-modal-title';
    title.textContent = 'Beta Version';
    title.style.cssText = 'margin: 0 0 15px 0; color: #333;';

    const message = document.createElement('p');
    message.textContent = 'This is a beta version of the Fabric Analysis tool. While we strive for accuracy, information may vary and should be verified against product details.';
    message.style.cssText = 'margin: 0 0 20px 0; color: #666; line-height: 1.5;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Got it';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.style.cssText = 'background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;';
    closeBtn.onclick = () => modal.remove();

    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Focus trap
    closeBtn.focus();

    document.body.appendChild(modal);
}

function showBugReportForm() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'bug-report-modal';
    modal.id = 'bug-report-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'bug-modal-title');

    const modalContent = document.createElement('div');
    modalContent.className = 'bug-report-modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'bug-report-modal-header';

    const modalTitle = document.createElement('h3');
    modalTitle.id = 'bug-modal-title';
    modalTitle.textContent = 'Report a Bug';

    const closeModalBtn = document.createElement('button');
    closeModalBtn.className = 'close-modal-button';
    closeModalBtn.textContent = '✕';
    closeModalBtn.setAttribute('aria-label', 'Close modal');
    closeModalBtn.onclick = () => modal.remove();

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeModalBtn);

    const form = document.createElement('form');
    form.className = 'bug-report-form';

    // URL field
    const urlField = document.createElement('div');
    urlField.className = 'form-field';

    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'Page URL:';
    urlLabel.htmlFor = 'bug-url';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.id = 'bug-url';
    urlInput.value = window.location.href;
    urlInput.readOnly = true;

    urlField.appendChild(urlLabel);
    urlField.appendChild(urlInput);

    // Site config field (pre-filled)
    const configField = document.createElement('div');
    configField.className = 'form-field';

    const configLabel = document.createElement('label');
    configLabel.textContent = 'Detected Site:';
    configLabel.htmlFor = 'bug-config';

    const configInput = document.createElement('input');
    configInput.type = 'text';
    configInput.id = 'bug-config';
    const siteConfig = window.getCurrentSiteConfig();
    configInput.value = siteConfig === window.siteConfig.default ? 'Default parser' : window.location.hostname;
    configInput.readOnly = true;

    configField.appendChild(configLabel);
    configField.appendChild(configInput);

    // Composition found field
    const compositionField = document.createElement('div');
    compositionField.className = 'form-field';

    const compositionLabel = document.createElement('label');
    compositionLabel.textContent = 'Raw Text Found:';
    compositionLabel.htmlFor = 'bug-composition';

    const compositionTextarea = document.createElement('textarea');
    compositionTextarea.id = 'bug-composition';
    compositionTextarea.rows = 3;
    compositionTextarea.readOnly = true;
    const compositions = window.findCompositionSections();
    compositionTextarea.value = compositions.length > 0
        ? compositions.map(c => `${c.component}: ${c.text}`).join('\n')
        : 'No composition found';

    compositionField.appendChild(compositionLabel);
    compositionField.appendChild(compositionTextarea);

    // Description field
    const descField = document.createElement('div');
    descField.className = 'form-field';

    const descLabel = document.createElement('label');
    descLabel.textContent = 'What went wrong?';
    descLabel.htmlFor = 'bug-description';

    const descTextarea = document.createElement('textarea');
    descTextarea.id = 'bug-description';
    descTextarea.placeholder = 'Describe the issue you encountered...';
    descTextarea.rows = 4;
    descTextarea.required = true;

    descField.appendChild(descLabel);
    descField.appendChild(descTextarea);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Submit Report';
    submitBtn.className = 'submit-bug-report';

    form.appendChild(urlField);
    form.appendChild(configField);
    form.appendChild(compositionField);
    form.appendChild(descField);
    form.appendChild(submitBtn);

    // Handle form submission
    form.onsubmit = function(e) {
        e.preventDefault();

        const description = descTextarea.value.trim();
        if (!description) {
            alert('Please describe the issue.');
            return;
        }

        // Create bug report details
        const bugReportText =
            `Bug Report Details:\n\n` +
            `Page URL: ${window.location.href}\n\n` +
            `Detected Site: ${configInput.value}\n\n` +
            `Raw Text Found: ${compositionTextarea.value}\n\n` +
            `Description: ${description}\n\n` +
            `---\n` +
            `Reported via Fabric Composition Extension\n\n` +
            `Please send this report to: fabricompositionanalysis@gmail.com`;

        // Copy to clipboard
        navigator.clipboard.writeText(bugReportText).then(() => {
            alert('Bug report copied to clipboard! Please paste it into an email and send to fabricompositionanalysis@gmail.com');
        }).catch(() => {
            // Fallback if clipboard API fails
            const textArea = document.createElement('textarea');
            textArea.value = bugReportText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Bug report copied to clipboard! Please paste it into an email and send to fabricompositionanalysis@gmail.com');
        });

        modal.remove();
    };

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(form);
    modal.appendChild(modalContent);

    // Focus trap
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
    descTextarea.focus();
}

function createDisclaimerFooter() {
    const footer = document.createElement('div');
    footer.className = 'disclaimer-footer';
    footer.style.cssText = 'padding: 6px 12px; background: rgba(0,0,0,0.05); border-top: 1px solid rgba(0,0,0,0.1); text-align: center;';

    const text = document.createElement('p');
    text.style.cssText = 'margin: 0; font-size: 10px; color: rgba(0,0,0,0.5); line-height: 1.4;';
    text.textContent = 'For informational purposes only. Please verify with official product details.';

    footer.appendChild(text);
    return footer;
}

// Export to global scope for use by other content scripts
window.createFloatingUI = createFloatingUI;
window.updateFloatingUI = updateFloatingUI;
window.showNoCompositionUI = showNoCompositionUI;
window.showErrorUI = showErrorUI;
window.showLoadingUI = showLoadingUI;
window.showBugReportForm = showBugReportForm;
window.showBetaInfo = showBetaInfo;
