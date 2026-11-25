import React from 'react';

const IMG = '/blog/helpdesk-simulator';

function Figure({ src, alt, children }) {
    return (
        <figure className="blog-figure">
            <a href={`${IMG}/${src}`} target="_blank" rel="noreferrer">
                <img src={`${IMG}/${src}`} alt={alt} loading="lazy" />
            </a>
            <figcaption>{children}</figcaption>
        </figure>
    );
}

function HelpdeskSimulatorPost() {
    return (
        <>
            <p>
                Entry-level help desk postings ask for the same things: clear communication with users, a
                sensible troubleshooting order, and knowing when to escalate instead of trying to fix
                everything yourself. Those skills are hard to show on a résumé and hard to practise without a
                job. So I built a simulator that hands you a ticket from an AI-played user, gives you a machine
                to investigate, and grades how you handled it.
            </p>
            <p>
                It runs entirely on my home server, models included. This post walks through one complete
                ticket and then explains what's underneath.
            </p>

            <h2>Picking a scenario</h2>
            <p>
                Each scenario is a common tier-1 problem: a locked-out account, a full disk, a DNS failure, a
                web app broken by a bad release, a stuck print queue, a Documents folder the user can't save
                to, an expired VPN password, a mapped drive that won't connect, a laptop on the wrong Wi-Fi.
                Six of the nine run on a real, disposable Linux machine with the fault actually injected; the
                other three still use a scripted shell. The card states the symptom the user would report and
                what access you get, and nothing about the cause, so you start where a real technician starts.
            </p>
            <Figure src="01-scenarios.png" alt="Scenario cards tagged Live Machine or Simulated Shell, with the company-wiki scenario selected">
                The scenario list. The cards give the symptom and your access, never the cause.
            </Figure>

            <h2>The ticket arrives</h2>
            <p>
                When a session starts, the simulator rolls a <strong>persona</strong>: random values for
                patience, technical literacy, verbosity, formality and mood volatility. A local language model
                then writes the opening ticket in that person's voice. The same problem can come from a terse
                engineer or from someone who just wants their wiki back and doesn't care why.
            </p>
            <p>
                While the persona writes, the lab builds the machine: it clones a clean workstation, injects
                the fault, and hands you a terminal on it and a view of the user's screen. For this ticket
                that took about 50 seconds.
            </p>
            <Figure src="02-opening-ticket.png" alt="The opening message from the simulated user beside an empty terminal on the workstation ws-jsmith">
                The DNS scenario's opening message. The terminal on the right is a real shell on the user's
                workstation, still empty.
            </Figure>

            <h2>Investigating</h2>
            <p>
                The terminal is a real shell, logged in as a technician account with sudo, so any command
                works. In this ticket a reasonable order is: check <code>/etc/resolv.conf</code>, try{' '}
                <code>nslookup</code> against the wiki, then look at the NetworkManager profile with{' '}
                <code>nmcli con show</code>. That shows the cause. Someone hard-coded a DNS server
                (<code>10.0.0.99</code>) that doesn't answer and told the profile to ignore the corporate
                one that DHCP offers.
            </p>
            <p>
                The conversation runs alongside. You can ask the user questions, and they answer in
                character. Here the technician asks what the contractor worked on, explains the problem in
                plain language, and asks permission before changing anything, since the fix briefly drops the
                network.
            </p>
            <Figure src="03-diagnosis.png" alt="Technician's reply explaining the DNS problem, the user's go-ahead, and terminal output showing the manual DNS override">
                Left: the explanation and the user's go-ahead. Right: <code>nslookup</code> can't reach the
                configured server, and <code>nmcli</code> shows the manual override and the server DHCP
                offers. Lab addresses are blurred.
            </Figure>

            <h2>Fixing and verifying</h2>
            <p>
                The fix is two commands: clear the manual server and stop ignoring DHCP's, then reapply the
                profile. Nothing is scripted on a live machine, so after the change{' '}
                <code>resolv.conf</code> really does list the corporate server, <code>nslookup</code>{' '}
                resolves the wiki, and the wiki answers over HTTP. Checking the result is part of the job, and
                the grader looks for it.
            </p>
            <Figure src="04-fix.png" alt="Terminal output after the fix: resolv.conf lists the corporate DNS server, nslookup resolves wiki.corp.internal and curl gets HTTP 200">
                After <code>nmcli con mod</code> and <code>nmcli con up</code>, the wiki resolves and loads.
            </Figure>
            <p>
                Then you ask the user to try again. The persona doesn't take your word for it: before each
                reply, the lab checks what the user would actually see on the machine, so they only report
                the wiki working once it does. You can look for yourself in the second tab, which shows the
                user's desktop.
            </p>
            <Figure src="04b-user-desktop.png" alt="The user's desktop in the second console tab, with the Corp Wiki open in Firefox, and the user confirming in the conversation that it loads">
                The user's screen with the wiki open, and their confirmation on the left.
            </Figure>

            <h2>Closing and grading</h2>
            <p>
                To finish, you either close the ticket or escalate it to a named team, and write resolution
                notes. Escalating is not a failure. Some scenarios are built so that escalating with good notes
                is the best answer. On a live machine, the lab first measures it: did the fault's checks go
                from failing to passing, and did anything that worked before break? That decides the outcome.
                Then a second model reads the whole session (conversation, the terminal transcript, timing,
                notes and the machine's evidence) and scores six areas: diagnostic accuracy, diagnostic
                efficiency, escalation judgment, change safety, response timeliness and customer service.
            </p>
            <Figure src="05-grade.png" alt="Grading report: 98 out of 100, six rubric items, written feedback, the machine's checks marked fixed or OK, and an explanation of the fault">
                The grading report for this session, with the machine's before-and-after checks and a
                debrief of what was actually wrong. Lab addresses are blurred.
            </Figure>
            <p>
                This session was worked by an AI agent I use for browser testing, which also took these
                screenshots. It lost one point, on efficiency, for not pinging the gateway to rule out routing
                before settling on DNS. The first version of this post had a perfect score from the same kind
                of agent, and that one wasn't deserved. The agent never checked back with the user after the
                fix, and its notes said the user had "confirmed the change," when the user had only given
                permission. The grader still gave 10/10 for customer service. It was running on the same small,
                fast model as the personas, and it was too generous.
            </p>
            <p>
                Since then I've moved grading to a larger model and had the agent work deliberately flawed
                tickets: a made-up fix, a lazy escalation, a rude but correct fix, and a repeat of that first
                session. The larger model caught the made-up fix and the rude replies. On the repeat it noticed
                the false claim but still barely took points off, so the grader now also answers whether the
                notes invent anything, and the code caps the score when they do. It does the same when the
                user is never told the problem is fixed. The model is good at noticing; the rules about how
                much it costs live in code.
            </p>

            <h2>Under the hood</h2>
            <ul>
                <li>
                    <strong>Scenarios are YAML files.</strong> A lab scenario names the machine template, the
                    fault to inject, the ticket and the persona's facts, and the checks that decide whether
                    it's fixed, plus guard checks that catch collateral damage like a broken sudoers file. The
                    three scripted scenarios instead describe every command the shell understands. Those
                    commands are regex-matched, return realistic output, and can record a "discovery" that
                    changes what later commands return.
                </li>
                <li>
                    <strong>Tickets live in Zammad</strong>, a self-hosted ticketing system, so each session is
                    a real ticket thread. A Flask service creates the tickets, posts replies from
                    the persona, requests machines from the lab, and handles grading.
                </li>
                <li>
                    <strong>The models run locally</strong> on the same server through an OpenAI-compatible API.
                    The personas use Qwen 3.6 35B-A3B, a mixture-of-experts model that replies in about a
                    second with its reasoning mode turned off. Grading uses a 27B Qwen 3.8 model and takes
                    around 20 seconds.
                </li>
                <li>
                    <strong>Users follow up on their own.</strong> A scheduler checks open tickets and sends
                    follow-ups at intervals based on patience. If you leave an impatient user waiting, you'll
                    hear about it.
                </li>
                <li>
                    <strong>The machines come from a separate lab.</strong> It runs nested containers on the
                    same server, on an isolated fake company network with its own DNS, wiki and print server.
                    Each session clones a frozen Debian template, injects the fault and serves a browser
                    terminal and, for desktop tickets, the user's screen over VNC. The clone is destroyed when
                    you submit, or after 45 idle minutes.
                </li>
            </ul>

            <h2>Why it's not public</h2>
            <p>
                The simulator used to be open on this site. It now runs only on my private network: every
                session uses real GPU time on a home server, and the real-machine lab isn't something I want to
                give strangers. If you're curious about how it works or want to talk about it, the code for the
                simulator is on{' '}
                <a href="https://github.com/CaramelLatte/helpdesk-sim" target="_blank" rel="noreferrer">GitHub</a>.
            </p>
        </>
    );
}

export default HelpdeskSimulatorPost;
