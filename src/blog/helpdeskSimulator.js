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
                mapped drive that won't connect, an offline printer, a crashed web service, a laptop on the
                wrong Wi-Fi. The card states the symptom the user would report and nothing else, so you start
                where a real technician starts.
            </p>
            <Figure src="01-scenarios.png" alt="The simulator's start page: a four-step how-to and a grid of scenario cards">
                The start page. The cards give the symptom, never the cause.
            </Figure>

            <h2>The ticket arrives</h2>
            <p>
                When a session starts, the simulator rolls a <strong>persona</strong>: random values for
                patience, technical literacy, verbosity, formality and mood volatility. A local language model
                then writes the opening ticket in that person's voice. The same problem can come from a terse
                engineer or from someone who just wants their wiki back and doesn't care why.
            </p>
            <Figure src="02-opening-ticket.png" alt="The opening message from the simulated user, with the empty shell and resolution panels beside it">
                The DNS scenario's opening message. The shell is empty and the resolution panel is waiting.
            </Figure>

            <h2>Investigating</h2>
            <p>
                The shell panel takes real diagnostic commands. In this ticket a reasonable order is:
                check <code>/etc/resolv.conf</code>, try <code>nslookup</code> against the wiki, then look at
                the NetworkManager profile with <code>nmcli con show</code>. That shows the cause. Someone
                hard-coded a DNS server (<code>10.0.0.99</code>) that no longer answers, while DHCP offers the
                correct corporate one (<code>192.168.1.53</code>).
            </p>
            <p>
                The conversation runs alongside. You can ask the user questions, and they answer in
                character. Here the technician explains the problem in plain language, asks permission before
                changing anything, and asks whether anything changed recently.
            </p>
            <Figure src="03-diagnosis.png" alt="Technician's reply explaining the DNS problem, the user's answer, and nmcli output showing the manual DNS override">
                Left: the explanation and the user's reply. Right: <code>nmcli</code> shows the manual
                override and the DHCP-offered server.
            </Figure>

            <h2>Fixing and verifying</h2>
            <p>
                The fix is two commands: point the profile at the right server, then reapply it. The shell
                reacts to what you've done, so after the change <code>resolv.conf</code> shows the new
                server and <code>nslookup</code> resolves the wiki. Checking the result is part of the job,
                and the grader looks for it.
            </p>
            <Figure src="04-fix.png" alt="Shell output after the fix: resolv.conf shows 192.168.1.53 and nslookup resolves wiki.company.internal">
                After <code>nmcli con mod</code> and <code>nmcli con up</code>, the wiki resolves.
            </Figure>

            <h2>Closing and grading</h2>
            <p>
                To finish, you either close the ticket or escalate it to a named team, and write resolution
                notes. Escalating is not a failure. Some scenarios are built so that escalating with good notes
                is the best answer. Then a second model reads the whole session (conversation, commands, timing
                and notes) and scores five areas: diagnostic accuracy, diagnostic efficiency, escalation
                judgment, response timeliness and customer service.
            </p>
            <Figure src="05-grade.png" alt="Grading report: 100 out of 100, five rubric items at 10 out of 10, and written feedback">
                The grading report for this session.
            </Figure>
            <p>
                One caveat about that perfect score. The session was worked by an AI agent I use for browser
                testing, which also took these screenshots. It never checked back with the user after the fix,
                and its notes said the user had "confirmed the change," when the user had only given
                permission. The grader still gave 10/10 for customer service. It was running on the same small,
                fast model as the personas, and it was too generous.
            </p>
            <p>
                Since then I've moved grading to a larger model and had the agent work deliberately flawed
                tickets: a made-up fix, a lazy escalation, a rude but correct fix, and a repeat of the session
                above. The larger model caught the made-up fix and the rude replies. On the repeat it noticed
                the false claim but still barely took points off, so the grader now also answers whether the
                notes invent anything, and the code caps the score when they do. It does the same when the
                user is never told the problem is fixed. The model is good at noticing; the rules about how
                much it costs live in code.
            </p>

            <h2>Under the hood</h2>
            <ul>
                <li>
                    <strong>Scenarios are YAML files.</strong> Each one describes the fault, the system's state
                    (hostnames, addresses, the bad and good values), and every command the shell understands.
                    Commands are regex-matched, return realistic output, and can record a "discovery". Once the
                    right discoveries exist, later commands return different output. That's how the shell
                    shows the fix taking effect.
                </li>
                <li>
                    <strong>Tickets live in Zammad</strong>, a self-hosted ticketing system, so each session is
                    a real ticket thread. A Flask service creates the tickets, posts replies from
                    the persona, and handles the shell and grading.
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
                    <strong>Real machines are the next step.</strong> I'm building a lab where each session gets
                    a disposable Linux container with the fault injected for real. The grade would then be
                    based on the machine's actual state before and after your session, not on scripted output.
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
