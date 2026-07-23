const contactGroup = document.querySelector(".contact-group");
const detailsName = document.querySelector(".details-name");
const detailsAdded = document.querySelector(".details-added");
const detailsPhone = document.querySelector(".details-phone");
const detailsEmail = document.querySelector(".details-email");
const detailsNote = document.querySelector(".details-note");
const detailsAvatar = document.querySelector(".avatar-large");

const savedContacts = document.querySelector(".saved-contacts");

const sidebarSection = document.querySelector(".sidebar");
const detailsSection = document.querySelector(".details");
const formSection = document.querySelector(".contact-form");

const searchInput = document.getElementById("search")

const themeButton = document.getElementById("theme-button");
const backButton = document.getElementById("back-button");

const formName = document.getElementById("form-name");
const formPhone = document.getElementById("form-phone");
const formEmail = document.getElementById("form-email");
const formNote = document.getElementById("form-note");

const addButton = document.querySelector(".add-contact");
const cancelButton = document.querySelector(".cancel-contact");
const contactForm = document.querySelector(".contact-form");
const deleteButton = document.querySelector(".delete-contact");
const editButton = document.querySelector(".edit-contact");

let contacts = [];
let currentContact = null;
let isCreating = false;

function getInitials(fullName) {
    return fullName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

async function init() {

    window.addEventListener("resize", updateLayout);

    loadTheme();

    contacts = await fetchJSON();

    sortContacts();

    updateContactsCount();

    if (contacts.length) {
        currentContact = contacts[0];
        renderContacts(contacts);
        renderContactDetails(currentContact);
    } else {
        renderContacts([]);
    }

    bindEvents();
    updateLayout();
}


async function fetchJSON() {
    try {
        const response = await fetch("contacts.json");
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
}

function bindEvents() {
    deleteButton.addEventListener("click", deleteContact);
    editButton.addEventListener("click", editContact);

    cancelButton.addEventListener("click", () => {
        isCreating = false;

        clearForm();
        showDetails();

        if (currentContact) {
            renderContactDetails(currentContact);
        }
    });
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveContact();
    });

    themeButton.addEventListener("click", toggleTheme);
    backButton.addEventListener("click", () => {
        showList();
    });

    addButton.addEventListener("click", () => {
        isCreating = true;
        clearForm();
        showForm();
    });

    searchContacts();
}

function sortContacts() {
    const collator = new Intl.Collator(["uk", "en"], {
        sensitivity: "base"
    });

    contacts.sort((a, b) => collator.compare(a.name, b.name));
}

function updateLayout() {
    if (isMobile()) {
        showList();
    } else {
        sidebarSection.classList.remove("hidden");
        detailsSection.classList.remove("hidden");
        formSection.classList.add("hidden");
    }
}

function editContact() {
    isCreating = false;

    if (!currentContact) return;

    formName.value = currentContact.name;
    formPhone.value = currentContact.phone;
    formEmail.value = currentContact.email;
    formNote.value = currentContact.note;

    showForm();
}

function deleteContact() {

    if (!currentContact) return;

    if (!confirm(`Delete ${currentContact.name}?`)) {
        return;
    }

    contacts = contacts.filter(contact => contact.id !== currentContact.id);

    renderContacts(contacts);
    updateContactsCount();

    if (contacts.length > 0) {

        currentContact = contacts[0];

        renderContacts(contacts);
        renderContactDetails(currentContact);

    } else {

        currentContact = null;

        renderContacts([]);
        clearContactDetails();

    }
}

function updateContactsCount() {
    savedContacts.textContent = `${contacts.length} saved`;
}

function groupContactsByLetter(contacts) {

    const sorted = [...contacts].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    const groups = {};

    sorted.forEach(contact => {

        const letter = contact.name.charAt(0).toUpperCase();

        if (!groups[letter]) {
            groups[letter] = [];
        }

        groups[letter].push(contact);

    });

    return groups;
}

function renderContacts(arrayOfContacts, activeId = null) {
    contactGroup.innerHTML = "";

    contactGroup.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("contacts-list");

    const groups = groupContactsByLetter(arrayOfContacts);

    Object.entries(groups).forEach(([letter, contacts]) => {

        const letterLi = document.createElement("li");
        letterLi.className = "contact-letter";
        letterLi.textContent = letter;

        ul.appendChild(letterLi);

        contacts.forEach(contact => {

            const li = document.createElement("li");
            const div1 = document.createElement("div");
            const div2 = document.createElement("div");
            const p1 = document.createElement("p");
            const p2 = document.createElement("p");

            div1.classList.add("avatar", "avatar-small");
            div2.classList.add("contact-summary");

            p1.classList.add("contact-name");
            p2.classList.add("contact-meta");

            div1.textContent = getInitials(contact.name);
            p1.textContent = contact.name;
            p2.textContent = contact.phone || contact.email;

            div2.append(p1, p2);
            li.append(div1, div2);

            if (currentContact && contact.id === currentContact.id) {
                li.classList.add("contact--active");
            }

            li.addEventListener("click", () => {
                currentContact = contact;

                renderContacts(arrayOfContacts);
                renderContactDetails(contact);

                if (isMobile()) {
                    showDetails();
                }
            });

            ul.appendChild(li);
        });

    });

    contactGroup.appendChild(ul);

}

function renderContactDetails(contact) {
    currentContact = contact;

    detailsAvatar.textContent = getInitials(contact.name);
    detailsName.textContent = contact.name;
    detailsAdded.textContent = `Added ${formatDate(contact.created_at)}`;
    detailsPhone.textContent = contact.phone;
    detailsEmail.textContent = contact.email;
    detailsNote.textContent = contact.note;
}

function clearContactDetails() {
    detailsAvatar.textContent = "?";
    detailsName.textContent = "No contact selected";
    detailsAdded.textContent = "";
    detailsPhone.textContent = "";
    detailsEmail.textContent = "";
    detailsNote.textContent = "";
}

function searchContacts() {

    searchInput.addEventListener("input", () => {
        const text = searchInput.value.toLowerCase().trim();

        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(text) ||
            (contact.phone || "").toLowerCase().includes(text) ||
            (contact.email || "").toLowerCase().includes(text)
        );

        if (filteredContacts.length > 0) {

            currentContact = filteredContacts[0];

            renderContacts(filteredContacts);
            renderContactDetails(currentContact);

        } else {

            currentContact = null;

            renderContacts([]);
            clearContactDetails();
        }
    });
}

function showList() {
    if (!isMobile()) {
        sidebarSection.classList.remove("hidden");
        detailsSection.classList.remove("hidden");
        formSection.classList.add("hidden");
        return;
    }

    showScreen(sidebarSection);
}

function showDetails() {
    if (!isMobile()) {
        formSection.classList.add("hidden");
        detailsSection.classList.remove("hidden");
        return;
    }

    showScreen(detailsSection);
}

function showForm() {
    if (!isMobile()) {
        detailsSection.classList.add("hidden");
        formSection.classList.remove("hidden");
        return;
    }

    showScreen(formSection);
}

function showScreen(screen) {
    sidebarSection.classList.add("hidden");
    detailsSection.classList.add("hidden");
    formSection.classList.add("hidden");

    screen.classList.remove("hidden");
}

function clearForm() {
    formName.value = "";
    formPhone.value = "";
    formEmail.value = "";
    formNote.value = "";
}

function saveContact() {

    if (!formName.value.trim()) {
        alert("Name is required");
        return;
    }

    if (!isCreating) {

        currentContact.name = formName.value.trim();
        currentContact.phone = formPhone.value.trim();
        currentContact.email = formEmail.value.trim();
        currentContact.note = formNote.value.trim();

        sortContacts();
        renderContactDetails(currentContact);
        renderContacts(contacts);

    } else {

        const newContact = {
            id: Date.now(),
            name: formName.value.trim(),
            phone: formPhone.value.trim(),
            email: formEmail.value.trim(),
            note: formNote.value.trim(),
            created_at: new Date().toISOString()
        };

        contacts.push(newContact);

        sortContacts();

        currentContact = newContact;

        renderContacts(contacts);
        renderContactDetails(currentContact);
    }

    updateContactsCount();

    isCreating = false;

    clearForm();
    showDetails();
}

function setTheme(theme){

    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);

    themeButton.innerHTML =
        theme === "dark"
            ? '<i data-lucide="sun"></i>'
            : '<i data-lucide="moon"></i>';

    lucide.createIcons();
}

function toggleTheme(){

    const currentTheme =
        document.documentElement.getAttribute("data-theme");

    if(currentTheme === "dark"){
        setTheme("light");
    }else{
        setTheme("dark");
    }

}

function loadTheme() {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        setTheme(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(prefersDark ? "dark" : "light");
}

function isMobile() {
    return window.innerWidth <= 768;
}
init();