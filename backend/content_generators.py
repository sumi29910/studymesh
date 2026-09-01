"""
Content generators for slides, flashcards, and quizzes.

Curated, factually real content for a set of common syllabus topics
(matched by keyword), and a more honestly-structured fallback for anything
else — no fake "this topic is a core concept" filler quiz questions. In a
production deployment, the fallback path would call an LLM API; kept local
here so the app runs with zero API keys.
"""

# ---------- Curated knowledge base ----------
# Each entry: slides (5), flashcards (4), quiz (3 real questions)

TOPICS = {
    "newton": {
        "match": ["newton", "laws of motion", "motion"],
        "slides": [
            ("Overview", "Newton's Laws of Motion", "Three laws, published by Isaac Newton in 1687, that describe how force and motion relate for everyday objects."),
            ("First Law", "Inertia", "An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted on by a net external force."),
            ("Second Law", "F = ma", "The net force on an object equals its mass times its acceleration. Double the force, double the acceleration (for the same mass)."),
            ("Third Law", "Action and reaction", "For every action there is an equal and opposite reaction — when you push a wall, it pushes back on you with equal force."),
            ("Recap", "Quick recap", "1st: objects resist changes in motion. 2nd: F=ma links force, mass, acceleration. 3rd: forces come in equal, opposite pairs."),
        ],
        "flashcards": [
            ("State Newton's First Law", "An object remains at rest or in uniform motion unless acted on by a net external force (the law of inertia)."),
            ("Formula for Newton's Second Law", "F = ma (Force = mass × acceleration)."),
            ("Give an example of Newton's Third Law", "Walking: your foot pushes back on the ground, the ground pushes you forward."),
            ("Why does a heavier object need more force to accelerate the same amount?", "Because F = ma — for the same acceleration, greater mass needs greater force."),
        ],
        "quiz": [
            ("What does Newton's First Law describe?", ["The relationship between force and acceleration", "An object's tendency to resist changes in its motion", "The relationship between mass and gravity", "How energy is conserved"], 1),
            ("If mass doubles and force stays the same, what happens to acceleration (by F=ma)?", ["It doubles", "It halves", "It stays the same", "It becomes zero"], 1),
            ("Newton's Third Law says every action has:", ["A smaller reaction", "No reaction", "An equal and opposite reaction", "A delayed reaction"], 2),
        ],
    },
    "thermodynamics": {
        "match": ["thermodynamics", "heat", "entropy"],
        "slides": [
            ("Overview", "What is Thermodynamics?", "The study of heat, energy, and work, and how they transfer between systems — foundational for engines, refrigerators, and chemical reactions."),
            ("Zeroth & First Law", "Energy is conserved", "The First Law: energy can't be created or destroyed, only converted (ΔU = Q − W). The Zeroth Law defines temperature via thermal equilibrium."),
            ("Second Law", "Entropy always increases", "In an isolated system, entropy (disorder) never decreases — this is why heat flows from hot to cold, not the reverse, without external work."),
            ("Third Law", "Absolute zero", "As temperature approaches absolute zero (0 K), the entropy of a perfect crystal approaches zero."),
            ("Recap", "Quick recap", "0th: defines temperature. 1st: energy conservation. 2nd: entropy increases. 3rd: behaviour near absolute zero."),
        ],
        "flashcards": [
            ("What does the First Law of Thermodynamics state?", "Energy cannot be created or destroyed, only transferred or converted (ΔU = Q − W)."),
            ("What is entropy?", "A measure of disorder or randomness in a system; it tends to increase over time in isolated systems."),
            ("Why can't heat flow from cold to hot on its own?", "It would decrease entropy of an isolated system, violating the Second Law."),
            ("What happens to entropy near absolute zero?", "It approaches zero for a perfect crystal (Third Law)."),
        ],
        "quiz": [
            ("The First Law of Thermodynamics is essentially a statement about:", ["Entropy", "Conservation of energy", "Absolute zero", "Pressure"], 1),
            ("According to the Second Law, in an isolated system entropy:", ["Always decreases", "Stays constant", "Never decreases", "Becomes negative"], 2),
            ("Which law defines temperature through thermal equilibrium?", ["First Law", "Second Law", "Third Law", "Zeroth Law"], 3),
        ],
    },
    "cell": {
        "match": ["cell biology", "cell structure", "cell "],
        "slides": [
            ("Overview", "Cell Biology Basics", "The cell is the basic structural and functional unit of life — every living organism is made of one or more cells."),
            ("Cell types", "Prokaryotic vs eukaryotic", "Prokaryotic cells (bacteria) have no nucleus. Eukaryotic cells (plants, animals, fungi) have a membrane-bound nucleus and organelles."),
            ("Key organelles", "Nucleus, mitochondria, ribosomes", "The nucleus stores DNA. Mitochondria produce ATP (energy). Ribosomes synthesize proteins."),
            ("Cell membrane", "Selective barrier", "The cell membrane controls what enters and exits the cell — it's selectively permeable, made of a phospholipid bilayer."),
            ("Recap", "Quick recap", "Cells are life's basic unit; eukaryotic cells have a nucleus and organelles; the membrane regulates what moves in and out."),
        ],
        "flashcards": [
            ("What is the basic unit of life?", "The cell."),
            ("Difference between prokaryotic and eukaryotic cells?", "Prokaryotic cells lack a nucleus; eukaryotic cells have a membrane-bound nucleus."),
            ("What is the function of mitochondria?", "They produce ATP — the cell's main energy currency (the 'powerhouse of the cell')."),
            ("What does the cell membrane do?", "Regulates what substances enter and exit the cell (selectively permeable)."),
        ],
        "quiz": [
            ("Which organelle is known as the 'powerhouse of the cell'?", ["Nucleus", "Ribosome", "Mitochondria", "Cell membrane"], 2),
            ("What is the key difference between prokaryotic and eukaryotic cells?", ["Presence of a cell wall", "Presence of a membrane-bound nucleus", "Ability to move", "Size only"], 1),
            ("The cell membrane is best described as:", ["Completely impermeable", "Selectively permeable", "Made of pure protein", "Only found in plant cells"], 1),
        ],
    },
    "photosynthesis": {
        "match": ["photosynthesis"],
        "slides": [
            ("Overview", "What is Photosynthesis?", "The process by which plants, algae, and some bacteria convert light energy into chemical energy (glucose), releasing oxygen."),
            ("The equation", "6CO2 + 6H2O + light → C6H12O6 + 6O2", "Carbon dioxide and water, using light energy, become glucose and oxygen — occurring mainly in the chloroplasts."),
            ("Two stages", "Light-dependent & light-independent", "Light-dependent reactions (in thylakoids) capture light energy. The Calvin cycle (light-independent, in the stroma) builds glucose from CO2."),
            ("Chlorophyll's role", "Capturing light", "Chlorophyll, the green pigment in chloroplasts, absorbs light — mainly red and blue wavelengths — to power the reaction."),
            ("Recap", "Quick recap", "Photosynthesis converts light + CO2 + water into glucose + oxygen, in two stages, powered by chlorophyll."),
        ],
        "flashcards": [
            ("What is the overall equation for photosynthesis?", "6CO2 + 6H2O + light energy → C6H12O6 + 6O2"),
            ("Where does photosynthesis occur in the plant cell?", "In the chloroplasts."),
            ("What are the two main stages of photosynthesis?", "Light-dependent reactions and the Calvin cycle (light-independent reactions)."),
            ("What pigment captures light for photosynthesis?", "Chlorophyll."),
        ],
        "quiz": [
            ("What are the main products of photosynthesis?", ["Carbon dioxide and water", "Glucose and oxygen", "ATP and nitrogen", "Water and oxygen only"], 1),
            ("Where in the plant cell does photosynthesis take place?", ["Mitochondria", "Nucleus", "Chloroplasts", "Ribosomes"], 2),
            ("Which pigment is primarily responsible for absorbing light in photosynthesis?", ["Melanin", "Chlorophyll", "Hemoglobin", "Carotene"], 1),
        ],
    },
    "french revolution": {
        "match": ["french revolution"],
        "slides": [
            ("Overview", "The French Revolution (1789–1799)", "A period of radical political and social upheaval in France that ended the monarchy and reshaped European politics."),
            ("Causes", "Why it happened", "Financial crisis from war debt, food shortages, unfair taxation of the Third Estate, and Enlightenment ideas about liberty and equality."),
            ("Key event", "Storming of the Bastille", "On 14 July 1789, revolutionaries stormed the Bastille prison — a symbol of royal authority — marking the Revolution's start."),
            ("Outcome", "End of the monarchy", "King Louis XVI was executed in 1793; France became a republic, though the Revolution later gave way to Napoleon's rise."),
            ("Recap", "Quick recap", "Triggered by debt, taxes, and Enlightenment ideas; began 1789 with the Bastille; ended the monarchy and reshaped France."),
        ],
        "flashcards": [
            ("When did the French Revolution begin?", "1789."),
            ("What event on 14 July 1789 is seen as the Revolution's start?", "The Storming of the Bastille."),
            ("Name one major cause of the French Revolution.", "Financial crisis from war debt and unfair taxation of the Third Estate (commoners)."),
            ("What happened to King Louis XVI?", "He was executed in 1793 after France became a republic."),
        ],
        "quiz": [
            ("What event is considered the start of the French Revolution?", ["Signing of the Constitution", "Storming of the Bastille", "Execution of Louis XVI", "Rise of Napoleon"], 1),
            ("Which social class bore the heaviest tax burden before the Revolution?", ["The clergy (First Estate)", "The nobility (Second Estate)", "The commoners (Third Estate)", "The army"], 2),
            ("What ultimately happened to the French monarchy after the Revolution?", ["It was strengthened", "It was abolished and Louis XVI was executed", "It moved to England", "Nothing changed"], 1),
        ],
    },
    "trees": {
        "match": ["trees", "binary tree", "data structure"],
        "slides": [
            ("Overview", "Trees (Data Structure)", "A tree is a hierarchical data structure with a root node and child nodes — no cycles, unlike a graph."),
            ("Key terms", "Root, leaf, height", "Root: topmost node. Leaf: node with no children. Height: longest path from root to a leaf."),
            ("Binary trees", "At most 2 children", "A binary tree restricts each node to at most two children, usually called 'left' and 'right'."),
            ("Traversals", "Inorder, preorder, postorder", "Inorder (left, root, right) gives sorted order in a BST. Preorder (root, left, right) and postorder (left, right, root) serve other use cases."),
            ("Recap", "Quick recap", "Trees are hierarchical, acyclic structures; binary trees cap children at two; traversal order determines what you visit first."),
        ],
        "flashcards": [
            ("What is the root of a tree?", "The topmost node, with no parent."),
            ("What is a leaf node?", "A node with no children."),
            ("What's the max number of children in a binary tree node?", "Two."),
            ("What does inorder traversal give you in a Binary Search Tree?", "The elements in sorted order."),
        ],
        "quiz": [
            ("In a binary tree, each node has at most how many children?", ["1", "2", "3", "Unlimited"], 1),
            ("What is a leaf node?", ["The root of the tree", "A node with no children", "A node with two children", "The tallest node"], 1),
            ("Inorder traversal of a Binary Search Tree visits nodes in:", ["Random order", "Reverse order", "Sorted order", "Depth order"], 2),
        ],
    },
    "chemical bonding": {
        "match": ["chemical bonding", "ionic bond", "covalent bond"],
        "slides": [
            ("Overview", "Chemical Bonding", "Atoms bond to reach a stable electron configuration, usually a full outer shell — this is what holds molecules together."),
            ("Ionic bonds", "Electron transfer", "Formed when one atom transfers electrons to another, creating oppositely charged ions that attract (e.g. NaCl — sodium chloride)."),
            ("Covalent bonds", "Electron sharing", "Formed when atoms share electron pairs, common between nonmetals (e.g. H2O, where oxygen shares electrons with two hydrogens)."),
            ("Metallic bonds", "Electron sea", "In metals, electrons move freely across a lattice of positive ions — explaining conductivity and malleability."),
            ("Recap", "Quick recap", "Ionic: transfer electrons. Covalent: share electrons. Metallic: electrons flow freely across a lattice."),
        ],
        "flashcards": [
            ("What is an ionic bond?", "A bond formed by the transfer of electrons between atoms, creating attracting oppositely-charged ions."),
            ("What is a covalent bond?", "A bond formed when atoms share electron pairs."),
            ("Give an example of an ionic compound.", "Sodium chloride (NaCl) — table salt."),
            ("Why are metals good conductors?", "Their electrons move freely across the metal lattice (the 'electron sea')."),
        ],
        "quiz": [
            ("An ionic bond forms through:", ["Sharing of electrons", "Transfer of electrons", "Sharing of protons", "Loss of neutrons"], 1),
            ("Which type of bond is found in water (H2O)?", ["Ionic", "Metallic", "Covalent", "Hydrogen only"], 2),
            ("Why do metals conduct electricity well?", ["They have no electrons", "Electrons are fixed in place", "Electrons move freely through the lattice", "They are ionic compounds"], 2),
        ],
    },
    "probability": {
        "match": ["probability"],
        "slides": [
            ("Overview", "Probability Basics", "Probability measures how likely an event is, from 0 (impossible) to 1 (certain)."),
            ("Basic formula", "P(A) = favourable outcomes / total outcomes", "For equally likely outcomes, probability is the count of favourable outcomes divided by all possible outcomes."),
            ("Independent events", "P(A and B) = P(A) × P(B)", "If two events don't affect each other (like two coin flips), multiply their individual probabilities."),
            ("Complementary events", "P(not A) = 1 − P(A)", "The probability an event does NOT happen is 1 minus the probability it does happen."),
            ("Recap", "Quick recap", "Probability ranges 0 to 1; independent events multiply; complements subtract from 1."),
        ],
        "flashcards": [
            ("What is the probability of a certain event?", "1."),
            ("What is the probability of an impossible event?", "0."),
            ("Formula for probability of an event (equally likely outcomes)?", "Favourable outcomes ÷ total possible outcomes."),
            ("How do you find P(not A)?", "1 − P(A)."),
        ],
        "quiz": [
            ("What is the probability of an impossible event?", ["1", "0.5", "0", "Undefined"], 2),
            ("If two events are independent, P(A and B) equals:", ["P(A) + P(B)", "P(A) × P(B)", "P(A) − P(B)", "P(A) / P(B)"], 1),
            ("If P(A) = 0.3, what is P(not A)?", ["0.3", "1.3", "0.7", "0"], 2),
        ],
    },
    "dna": {
        "match": ["dna", "dna replication"],
        "slides": [
            ("Overview", "DNA Replication", "The process by which a cell copies its DNA before dividing, so each new cell gets a complete set of genetic instructions."),
            ("Structure first", "The double helix", "DNA is a double helix of two strands held together by base pairs: Adenine-Thymine and Guanine-Cytosine."),
            ("The process", "Semi-conservative replication", "The double helix unwinds, and each strand serves as a template for a new complementary strand — each new DNA has one old, one new strand."),
            ("Key enzyme", "DNA polymerase", "This enzyme reads the template strand and adds matching nucleotides to build the new strand."),
            ("Recap", "Quick recap", "DNA unwinds, each strand templates a new one, DNA polymerase builds it — result: two identical DNA copies."),
        ],
        "flashcards": [
            ("What are DNA's base pairs?", "Adenine-Thymine (A-T) and Guanine-Cytosine (G-C)."),
            ("What does 'semi-conservative' replication mean?", "Each new DNA molecule has one original (old) strand and one newly synthesized strand."),
            ("Which enzyme builds the new DNA strand?", "DNA polymerase."),
            ("Why does DNA need to replicate?", "So each new cell produced by division gets a complete, identical set of genetic instructions."),
        ],
        "quiz": [
            ("DNA replication is described as 'semi-conservative' because:", ["Both new strands are entirely new", "Each new molecule has one old and one new strand", "No new DNA is made", "Only half the DNA is copied"], 1),
            ("Which enzyme is primarily responsible for building the new DNA strand?", ["RNA polymerase", "DNA polymerase", "Helicase only", "Ligase only"], 1),
            ("Which base pairs with Adenine in DNA?", ["Guanine", "Cytosine", "Thymine", "Uracil"], 2),
        ],
    },
    "world war": {
        "match": ["world war 2", "world war ii", "wwii", "world war 1", "world war i"],
        "slides": [
            ("Overview", "World War II (1939–1945)", "A global conflict involving most of the world's nations, triggered by Germany's invasion of Poland in 1939."),
            ("Key causes", "Why it started", "The harsh Treaty of Versailles, the Great Depression, and the rise of fascism in Germany, Italy, and Japan."),
            ("Turning points", "Key moments", "Pearl Harbor (1941) brought the US in; Stalingrad (1942–43) turned the war against Germany on the Eastern Front."),
            ("End of the war", "1945", "Germany surrendered in May 1945; Japan surrendered in August 1945, after atomic bombs were dropped on Hiroshima and Nagasaki."),
            ("Recap", "Quick recap", "Started 1939 with the invasion of Poland; key turning points include Pearl Harbor and Stalingrad; ended 1945."),
        ],
        "flashcards": [
            ("What event triggered the start of World War II?", "Germany's invasion of Poland in September 1939."),
            ("What event brought the United States into the war?", "The attack on Pearl Harbor in December 1941."),
            ("When did World War II end?", "1945 — Germany in May, Japan in August."),
            ("Name one major cause that led to World War II.", "The harsh terms of the Treaty of Versailles after World War I, which fuelled resentment in Germany."),
        ],
        "quiz": [
            ("What event marked the start of World War II?", ["Attack on Pearl Harbor", "Invasion of Poland by Germany", "Fall of Berlin", "Treaty of Versailles"], 1),
            ("Which event brought the United States into World War II?", ["D-Day", "Attack on Pearl Harbor", "Battle of Stalingrad", "Invasion of Poland"], 1),
            ("In what year did World War II end?", ["1943", "1944", "1945", "1946"], 2),
        ],
    },
}


def _find_topic(topic: str):
    t = topic.lower().strip()
    for data in TOPICS.values():
        for kw in data["match"]:
            if kw in t:
                return data
    return None


def make_slides(topic: str) -> list[dict]:
    data = _find_topic(topic)
    if data:
        return [{"kicker": k, "heading": h, "body": b} for (k, h, b) in data["slides"]]
    # Fallback for topics outside the curated set — honest about being a
    # generic study-skills framing rather than pretending to know facts it doesn't.
    clean = topic.strip()
    return [
        {"kicker": "Getting started", "heading": f"Building a study plan for {clean}", "body": f"Start by writing down what you already know about {clean}, then list what your syllabus expects you to be able to do with it."},
        {"kicker": "Break it down", "heading": "Split into sub-topics", "body": f"Divide {clean} into 3–4 smaller sub-topics. Tackle one at a time rather than the whole thing at once."},
        {"kicker": "Active recall", "heading": "Test yourself early", "body": f"After reading a sub-topic of {clean}, close your notes and try to explain it out loud or write it from memory."},
        {"kicker": "Worked examples", "heading": "Practice past questions", "body": f"Find past exam or textbook questions on {clean} and work through them, checking your answers against the solution."},
        {"kicker": "Recap", "heading": "Before the exam", "body": f"Revisit your {clean} notes 24 hours later, then again a few days later — spaced review beats one long session."},
    ]


def make_flashcards(topic: str) -> list[dict]:
    data = _find_topic(topic)
    if data:
        return [{"front": f, "back": b} for (f, b) in data["flashcards"]]
    clean = topic.strip()
    return [
        {"front": f"What's the one-sentence definition of {clean} you'd give a classmate?", "back": "Write your own version, then check it against your textbook definition."},
        {"front": f"What sub-topic of {clean} do you find hardest?", "back": "Flag it — that's what to spend extra practice time on."},
        {"front": f"Where does {clean} show up in past exam questions?", "back": "Check your last 2–3 papers or worksheets for the pattern."},
        {"front": f"Can you teach {clean} to someone else in 60 seconds?", "back": "If not yet, that's a sign to revisit your notes before moving on."},
    ]


def make_quiz(topic: str) -> list[dict]:
    data = _find_topic(topic)
    if data:
        return [{"q": q, "options": opts, "correct_index": ci} for (q, opts, ci) in data["quiz"]]
    clean = topic.strip()
    # Honest fallback: a self-check on study process, not invented facts.
    return [
        {
            "q": f"You've just finished reading your notes on {clean}. What's the best next step?",
            "options": ["Move on to a new topic immediately", "Close your notes and try to recall the key points", "Re-read the same notes a second time", "Skip revision until the night before the exam"],
            "correct_index": 1,
        },
        {
            "q": f"When practicing {clean} problems, what should you do if you get one wrong?",
            "options": ["Skip it and move on without checking", "Look at the answer and understand why you were wrong", "Guess again randomly", "Stop practicing that topic entirely"],
            "correct_index": 1,
        },
        {
            "q": f"What's a good sign that you actually understand {clean}, not just recognize it?",
            "options": ["You can explain it in your own words without notes", "You remember which page it's on", "You've highlighted it in your textbook", "You've read about it once"],
            "correct_index": 0,
        },
    ]
