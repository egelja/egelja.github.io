// Central directory of people whose names appear as authors/collaborators.
// Every name rendered via <Person> / <AuthorList> MUST have an entry here:
//   - a string  -> canonical homepage, name renders as a link
//   - null      -> known person, deliberately no homepage, renders as plain text
// A missing entry is a build error (see homepageFor).

export const PEOPLE: Record<string, string | null> = {
  "Nikola Vuk Maruszewski": null,

  // SEQC
  "Mingyoung Jessica Jeng": "https://www.mingyoungjeng.com/",
  "Mu-Te Lau": "https://www.linkedin.com/in/mu-te-joshua-lau",
  "Connor Selna": "https://www.linkedin.com/in/connor-selna/",
  "Michael Gavrincea": "https://www.linkedin.com/in/michael-gavrincea-2b08861ba",
  "Kaitlin N. Smith": "https://knsmith.github.io/",
  "Nikos Hardavellas": "https://users.cs.northwestern.edu/~hardav/",
  "Peter Dinda": "http://pdinda.org/",
  "Russ Joseph": "https://www.eecs.northwestern.edu/~rjoseph/",

  // FLINT / MTJ timekeeping
  "Jordan Athas": "https://scholar.google.com/citations?user=HgCu-4YAAAAJ",
  "Allison Fleming": "https://orcid.org/0009-0001-7114-3311",
  "Christian Duffee": "https://scholar.google.com/citations?user=Nis4nB0AAAAJ",
  "Eren Yildiz": "https://erenyildiz33.github.io/",
  "Saad Ahmed": "https://www.saadahmedch.com/",
  "Yaman Sangar": "https://ee.calpoly.edu/faculty/ysangar",
  "Pedram Khalili":
    "https://appliedphysics.northwestern.edu/people/faculty/pedram-khalili.html",
  "Josiah Hester": "https://josiahhester.com/",
};

// Leading honorific dropped before the directory lookup, so callers can pass
// "Dr. Nikos Hardavellas" and still resolve the "Nikos Hardavellas" entry.
const HONORIFIC = /^(?:Dr|Prof|Professor|Mr|Mrs|Ms)\.?\s+/i;

/** The directory key for a name (honorific stripped). */
export function nameKey(name: string): string {
  return name.replace(HONORIFIC, "");
}

/**
 * Homepage for a name: a URL string, or `null` when the person is known but has
 * no homepage. A leading honorific is ignored. Throws if the person is not in
 * the directory at all.
 */
export function homepageFor(name: string): string | null {
  const key = nameKey(name);
  if (!Object.prototype.hasOwnProperty.call(PEOPLE, key)) {
    throw new Error(
      `Unknown person "${key}". Add an entry to src/data/people.ts (a URL, or null for no homepage).`,
    );
  }
  return PEOPLE[key];
}
