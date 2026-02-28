/**
 * Interactive Terminal Component
 * Vanilla JS implementation of an interactive terminal for Jekyll portfolio.
 */
(function () {
    'use strict';

    // ── ASCII Art ────────────────────────────────────────────────
    var tuxAscii = [
        '       _nnnn_      ',
        '      dGGGGMMb     ',
        '     @p~qp~~qMb    ',
        '     M|@||@) M|    ',
        '     @,----.JM|    ',
        '    JS^\\__/  qKL   ',
        '   dZP        qKRb ',
        '  dZP          qKKb',
        '  fZP            SMMb',
        '  HZM            MMMM',
        '  FqM            MMMM',
        '  __| ".        |\\dS"qML',
        '  |    `.       | `\' \\Zq',
        ' _)      \\.___.,|     .\'',
        ' \\____   )MMMMMP|   .\'  ',
        '      `-\'       `--\'    '
    ].join('\n');

    // ── Command Definitions ─────────────────────────────────────
    var commands = {
        help: function () {
            return [
                '',
                'Available commands:',
                '  help          Show this help message',
                '  about         Learn about me',
                '  skills        View my technical skills',
                '  projects      See my highlights',
                '  contact       Get my contact information',
                '  neofetch      Display system info',
                '  whoami        Who am I?',
                '  ls            List portfolio sections',
                '  cat           View file contents (try: cat readme.md)',
                '  clear         Clear the terminal',
                '',
                "Type any command and press Enter to execute.",
                ''
            ].join('\n');
        },

        about: function () {
            return [
                '',
                "Hi! I'm Davide Rutigliano — a Senior Platform Engineer",
                'building GPU-accelerated Kubernetes platforms for AI/HPC workloads.',
                '',
                'I specialize in inference observability (vLLM, TTFT),',
                'cluster lifecycle operations, and internal developer platforms.',
                '',
                'Open-source contributor to Kubernetes, Kueue, and KubeAI.',
                "When I'm not engineering platforms, you'll find me",
                'exploring new tech, hiking, or enjoying a good espresso.',
                ''
            ].join('\n');
        },

        skills: function () {
            return [
                '',
                'Technical Skills',
                '================',
                '',
                'AI & GPU Infra:   NVIDIA MIG/vGPU, GPU-Operator, vLLM, LLM-Ops',
                '                  Kueue, TensorFlow, PyTorch',
                'Cloud Native:     Kubernetes, Helm, Docker, ArgoCD, Flux',
                '                  Terraform, GCP, AWS, Azure',
                'Observability:    OpenTelemetry, Prometheus, Grafana',
                '                  Alertmanager, StackState, RCA',
                'Development:      Go, Python, Java, Rust',
                '                  K8s Operators, Event-Driven Architecture',
                'Reliability:      SLIs/SLOs, runbooks, incident response',
                '                  postmortems, capacity planning',
                '',
                'Currently exploring: AI/ML infrastructure at scale',
                ''
            ].join('\n');
        },

        projects: function () {
            return [
                '',
                'Featured Highlights',
                '===================',
                '',
                '[1] vLLM & GenAI Observability',
                '    OTel connectors for vLLM inference (TTFT, KPIs)',
                '    Multi-tenant GPU inference platform triage',
                '',
                '[2] GPU Monitoring (40%+ HPC efficiency)',
                '    K8s/KubeVirt observability for NVIDIA MIG/vGPU',
                '',
                '[3] 62% Infra Cost Reduction ($100K+ savings)',
                '    K8s Cluster Auto-scaling with Cluster API',
                '    Across AWS, GCP, and on-prem',
                '',
                '[4] SUSE Observability MCP Server',
                '    LLM-driven analysis in the alerting pipeline',
                '',
                '[5] VM Migration Orchestration',
                '    K8s operator for 100+ VM migration (KVM → Harvester)',
                '',
                "Run 'cat projects.md' for more details.",
                ''
            ].join('\n');
        },

        contact: function () {
            return [
                '',
                'Contact Information',
                '===================',
                '',
                'GitHub:     github.com/DavideRutigliano',
                'LinkedIn:   linkedin.com/in/davide-rutigliano',
                'Email:      davide.ruti@gmail.com',
                'Medium:     medium.com/@davide.ruti',
                'Location:   Italy',
                '',
                'Feel free to reach out for collaborations,',
                'opportunities, or just to say hi!',
                ''
            ].join('\n');
        },

        whoami: function () {
            return 'davide';
        },

        ls: function () {
            return [
                '',
                'drwxr-xr-x  about/',
                'drwxr-xr-x  projects/',
                'drwxr-xr-x  skills/',
                'drwxr-xr-x  blog/',
                'drwxr-xr-x  notes/',
                '-rw-r--r--  readme.md',
                '-rw-r--r--  contact.md',
                '-rw-r--r--  projects.md',
                ''
            ].join('\n');
        },

        theme: function () {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            return [
                '',
                'Terminal Theme: Portfolio ' + (isDark ? 'Dark' : 'Light'),
                '==========================================',
                '',
                'This terminal adapts to your current site theme.',
                'Use the theme toggle in the navigation bar to switch.',
                '',
                'Current mode: ' + (isDark ? 'Dark 🌙' : 'Light ☀️'),
                ''
            ].join('\n');
        }
    };

    // ── Cat Files ───────────────────────────────────────────────
    var catFiles = {
        'readme.md': [
            '',
            '# Welcome to my Portfolio',
            '',
            'This is an interactive terminal built with vanilla JavaScript',
            'and styled to feel like a real terminal emulator.',
            '',
            '## Quick Start',
            '',
            "Type 'help' to see available commands.",
            '',
            '## Features',
            '',
            '- Interactive command input',
            '- Command history (use arrow keys)',
            '- Automatic light/dark mode support',
            '- Custom portfolio commands',
            '',
            'Enjoy exploring!',
            ''
        ].join('\n'),

        'contact.md': [
            '',
            'Contact Information',
            '===================',
            '',
            'GitHub:     github.com/DavideRutigliano',
            'LinkedIn:   linkedin.com/in/davide-rutigliano',
            'Email:      davide.ruti@gmail.com',
            'Location:   Italy',
            '',
            'Feel free to reach out for collaborations,',
            'opportunities, or just to say hi!',
            ''
        ].join('\n'),

        'projects.md': [
            '',
            '# Projects & Open Source',
            '',
            '## Kubernetes / Kueue',
            'Contributing to batch scheduling and job queueing',
            'for GPU workloads in Kubernetes.',
            '',
            '## KubeAI',
            'Inference platform for running LLMs on Kubernetes.',
            '',
            '## SUSE Observability MCP Server',
            'Built from idea to MVP: LLM-driven analysis',
            'embedded directly into the alerting pipeline.',
            '',
            '## Portfolio Website (this!)',
            'Jekyll + vanilla JS with interactive terminal.',
            '',
            "Visit /portfolio/ for detailed project pages.",
            ''
        ].join('\n')
    };

    // ── Neofetch Output ─────────────────────────────────────────
    function createNeofetchHTML() {
        var info = [
            { label: 'OS', value: 'Portfolio 2.0 (Jekyll)' },
            { label: 'Host', value: 'MacBook Pro' },
            { label: 'Kernel', value: 'Go + Python' },
            { label: 'Uptime', value: 'Always online' },
            { label: 'Shell', value: 'zsh (oh-my-zsh)' },
            { label: 'DE', value: 'VS Code + Neovim' },
            { label: 'WM', value: 'Kubernetes' },
            { label: 'Terminal', value: 'Ghostty + Kitty' },
            { label: 'Role', value: 'Senior Platform Engineer' },
            { label: 'Focus', value: 'GPU/AI Infrastructure' },
            { label: 'Location', value: 'Italy' },
            { label: 'Fuel', value: 'Espresso ☕️' }
        ];

        var container = document.createElement('div');
        container.className = 'terminal__neofetch';

        var asciiPre = document.createElement('pre');
        asciiPre.className = 'terminal__neofetch-ascii';
        asciiPre.textContent = tuxAscii;
        container.appendChild(asciiPre);

        var infoDiv = document.createElement('div');
        infoDiv.className = 'terminal__neofetch-info';

        // Header
        var header = document.createElement('div');
        header.innerHTML =
            '<span class="terminal__neofetch-user">davide</span>@<span class="terminal__neofetch-user">portfolio</span>';
        infoDiv.appendChild(header);

        var sep = document.createElement('div');
        sep.className = 'terminal__neofetch-sep';
        sep.textContent = '-----------------';
        infoDiv.appendChild(sep);

        for (var i = 0; i < info.length; i++) {
            var line = document.createElement('div');
            line.innerHTML =
                '<span class="terminal__neofetch-label">' +
                info[i].label +
                ':</span> ' +
                info[i].value;
            infoDiv.appendChild(line);
        }

        // Color palette row
        var palette1 = document.createElement('div');
        palette1.className = 'terminal__neofetch-palette';
        var colors1 = ['#e06c75', '#e5c07b', '#98c379', '#61afef', '#c678dd', '#56b6c2', '#abb2bf', '#5c6370'];
        for (var c = 0; c < colors1.length; c++) {
            var swatch = document.createElement('span');
            swatch.className = 'terminal__neofetch-swatch';
            swatch.style.backgroundColor = colors1[c];
            palette1.appendChild(swatch);
        }
        infoDiv.appendChild(palette1);

        container.appendChild(infoDiv);
        return container;
    }

    // ── Terminal Controller ─────────────────────────────────────
    function initTerminal() {
        var terminalEl = document.getElementById('terminal');
        if (!terminalEl) return;

        var contentEl = document.getElementById('terminal-content');
        var inputEl = document.getElementById('terminal-input');
        var cursorEl = document.getElementById('terminal-cursor');
        var inputLineEl = document.getElementById('terminal-input-line');

        var commandHistory = [];
        var historyIndex = -1;

        // Focus input on terminal click
        terminalEl.addEventListener('click', function () {
            inputEl.focus();
        });

        // Update cursor position
        function updateCursor() {
            if (cursorEl) {
                cursorEl.style.left = inputEl.value.length * 0.6 + 'em';
            }
        }

        inputEl.addEventListener('input', updateCursor);

        // Add output to terminal
        function addOutput(content) {
            var outputDiv = document.createElement('div');
            outputDiv.className = 'terminal__output animate-fade-in';

            if (content instanceof HTMLElement) {
                outputDiv.appendChild(content);
            } else {
                var pre = document.createElement('pre');
                pre.className = 'terminal__output-text';
                pre.textContent = content;
                outputDiv.appendChild(pre);
            }

            contentEl.insertBefore(outputDiv, inputLineEl);
            contentEl.scrollTop = contentEl.scrollHeight;
        }

        // Add input echo to terminal
        function addInputEcho(cmd) {
            var line = document.createElement('div');
            line.className = 'terminal__history-input';
            line.innerHTML =
                '<span class="terminal__prompt-arrow">❯</span> ' +
                '<span class="terminal__prompt-dollar">$</span> ' +
                '<span class="terminal__history-cmd">' + escapeHTML(cmd) + '</span>';
            contentEl.insertBefore(line, inputLineEl);
        }

        function escapeHTML(str) {
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }

        // Execute command
        function executeCommand(cmd) {
            var trimmed = cmd.trim().toLowerCase();
            var args = trimmed.split(' ');
            var command = args[0];

            addInputEcho(cmd);

            if (command === '') {
                // do nothing
            } else if (command === 'clear') {
                // Remove all output and history lines
                var children = contentEl.children;
                for (var i = children.length - 1; i >= 0; i--) {
                    if (children[i] !== inputLineEl) {
                        contentEl.removeChild(children[i]);
                    }
                }
            } else if (command === 'neofetch') {
                addOutput(createNeofetchHTML());
            } else if (command === 'cat') {
                var filename = args[1];
                if (!filename) {
                    addOutput('Usage: cat <filename>');
                } else if (catFiles[filename]) {
                    addOutput(catFiles[filename]);
                } else {
                    addOutput('cat: ' + filename + ': No such file or directory');
                }
            } else if (commands[command]) {
                addOutput(commands[command]());
            } else {
                addOutput(
                    'zsh: command not found: ' + command + "\nType 'help' to see available commands."
                );
            }

            // Update command history
            if (cmd.trim()) {
                commandHistory.push(cmd);
            }
            historyIndex = -1;

            // Scroll to bottom
            contentEl.scrollTop = contentEl.scrollHeight;
        }

        // Handle key events
        inputEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                executeCommand(inputEl.value);
                inputEl.value = '';
                updateCursor();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (commandHistory.length > 0) {
                    var newIndex =
                        historyIndex < commandHistory.length - 1
                            ? historyIndex + 1
                            : historyIndex;
                    historyIndex = newIndex;
                    inputEl.value =
                        commandHistory[commandHistory.length - 1 - newIndex] || '';
                    updateCursor();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    inputEl.value =
                        commandHistory[commandHistory.length - 1 - historyIndex] || '';
                } else {
                    historyIndex = -1;
                    inputEl.value = '';
                }
                updateCursor();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                executeCommand('clear');
            }
        });

        // Show neofetch on initial load
        addOutput(createNeofetchHTML());
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTerminal);
    } else {
        initTerminal();
    }
})();
