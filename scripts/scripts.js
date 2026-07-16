const contactGroup = document.querySelector(".contact-group");
const detailsName = document.querySelector(".details-name");
const detailsAdded = document.querySelector(".details-added");
const detailsPhone = document.querySelector(".details-phone");
const detailsEmail = document.querySelector(".details-email");
const detailsNote = document.querySelector(".details-note");
const detailsAvatar = document.querySelector(".avatar-large");

const savedContacts = document.querySelector(".saved-contacts");

const detailsSection = document.querySelector(".details");
const formSection = document.querySelector(".contact-form");

const searchInput = document.getElementById("search")

const formName = document.getElementById("form-name");
const formPhone = document.getElementById("form-phone");
const formEmail = document.getElementById("form-email");
const formNote = document.getElementById("form-note");

const addButton = document.querySelector(".add-contact");
const cancelButton = document.querySelector(".cancel-contact");
const saveButton = document.querySelector(".save-contact");
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
    contacts = await fetchJSON();

    allContacts(contacts)
    renderContacts(contacts);

    if (contacts.length > 0) {
        renderContactDetails(contacts[0]);
    }
    searchContacts(contacts)
    formForContact()

    deleteButton.addEventListener("click", deleteContact);
    editButton.addEventListener("click", editContact);
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
    allContacts(contacts);

    if (contacts.length > 0) {
        renderContactDetails(contacts[0]);
    } else {
        currentContact = null;
        clearContactDetails();
    }
}

function allContacts(contacts) {
    const totalContacts = contacts.length

    savedContacts.textContent = totalContacts + " saved";
}
function renderContacts(arrayOfContacts) {
    contactGroup.innerHTML = "";

    const ul = document.createElement("ul")
    ul.classList.add("contacts-list");

    arrayOfContacts.forEach((contact, index) => {
        const li = document.createElement("li");
        const div1 = document.createElement("div");
        const div2 = document.createElement("div");
        const p1 = document.createElement("p");
        const p2 = document.createElement("p");

        div1.classList.add('avatar', 'avatar-small');
        div2.classList.add("contact-summary");

        p1.classList.add("contact-name");
        p2.classList.add("contact-meta");

        div1.textContent = getInitials(contact.name);

        p1.textContent = contact.name;
        p2.textContent = contact.phone || contact.email;

        div2.appendChild(p1);
        div2.appendChild(p2);

        li.appendChild(div1);
        li.appendChild(div2);

        ul.appendChild(li);

        li.addEventListener("click", () => {
            const activeItem = document.querySelector(".contact--active");
            if (activeItem) {
                activeItem.classList.remove("contact--active");
            }
            li.classList.add("contact--active");
            renderContactDetails(contact);
        })

        if (index === 0) {
            li.classList.add("contact--active");
        }
    })

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

function searchContacts(contacts) {

    searchInput.addEventListener("input", () => {
        const text = searchInput.value.toLowerCase().trim();

        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(text) ||
            (contact.phone || "").toLowerCase().includes(text) ||
            (contact.email || "").toLowerCase().includes(text)
        );

        renderContacts(filteredContacts);

        if (filteredContacts.length > 0) {
            renderContactDetails(filteredContacts[0]);
        } else {
            clearContactDetails()

            const activeItem = document.querySelector(".contact--active");
            if (activeItem) {
                activeItem.classList.remove("contact--active");
            }
        }
    });
}

function showForm() {
    detailsSection.classList.add("hidden");
    formSection.classList.remove("hidden");
}

function showDetails() {
    formSection.classList.add("hidden");
    detailsSection.classList.remove("hidden");
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

        renderContacts(contacts);
        renderContactDetails(currentContact);

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

        renderContacts(contacts);
        renderContactDetails(newContact);

        currentContact = newContact;
    }

    allContacts(contacts);

    isCreating = false;

    clearForm();
    showDetails();
}

function formForContact() {
    addButton.addEventListener("click", () => {
        isCreating = true;

        clearForm();
        showForm();
    });

    cancelButton.addEventListener("click", () => {
        isCreating = false;

        clearForm();
        showDetails();

        if (currentContact) {
            renderContactDetails(currentContact);
        }
    });

    saveButton.addEventListener("click", saveContact);
}

init();