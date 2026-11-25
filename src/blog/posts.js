import HelpdeskSimulatorPost from './helpdeskSimulator';

export const TAGS = {
    ctf: 'CTF',
    cybersecurity: 'Cybersecurity',
    career: 'Career',
    project: 'Project',
    tutorial: 'Tutorial',
    homelab: 'Homelab',
    'it-concepts': 'IT Concepts',
};

// Each post: { id, title, date, tags, summary, body }
// body: a plain string (rendered as pre-line prose) or a component (for figures, headings, code).
// Newest first.
export const posts = [
    {
        id: 'helpdesk-simulator',
        title: 'Building an AI help desk simulator on my home server',
        date: '2026-11-03T12:00:00',
        tags: ['project', 'homelab', 'it-concepts'],
        summary: 'A walkthrough of one complete ticket: an AI-played user, a real workstation with a DNS fault, '
            + 'and a local model that grades the work. Plus what runs underneath.',
        body: HelpdeskSimulatorPost,
    },
];
