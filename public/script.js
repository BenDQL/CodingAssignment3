let zoomedPhoto;
class Card {
  constructor({ img, iso, lens, fRatio, sec }) {
    this.img = img;
    this.iso = iso;
    this.lens = lens;
    this.fRatio = fRatio;
    this.sec = sec;
  }

  generate() {
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.backgroundImage = `url(images/${this.img})`;
    const tag = document.createElement("div");
    tag.classList.add("tag");
    for (const item of [
      { name: "ISO", value: this.iso },
      { name: "Lens", value: this.lens },
      { name: "F", value: this.fRatio },
      { name: "Sec", value: this.sec },
    ]) {
      const itemDiv = document.createElement("div");
      itemDiv.textContent = `${item.name}: ${item.value}`;
      tag.appendChild(itemDiv);
    }
    card.appendChild(tag);
    card.addEventListener("click", () => {
      if (zoomedPhoto) {
        zoomedPhoto.remove(); // Remove the previous one from canvas if selecting another one
      }
      zoomedPhoto = selectPhotoToZoom(`images/${this.img}`);
      document.getElementById(
        "photo-params"
      ).textContent = `ISO: ${this.iso}, Lens: ${this.lens}mm, F: ${this.fRatio}, SEC: ${this.sec}`;
    });
    return card;
  }
}

const loadSelectedImage = () => {
  const createImage = () => {
    const uploadCard = document.querySelector("form#photo-upload .card");
    uploadCard.style.backgroundImage = `url(${fr.result})`;
    document.getElementById("upload-btn").disabled = false;
  };

  const input = document.getElementById("imgfile");
  if (!input.files[0]) {
    write("Please select a file before clicking 'Load'");
    return;
  }
  const file = input.files[0];
  const fr = new FileReader();
  fr.onload = createImage;
  fr.readAsDataURL(file);
};

fetch("config.json")
  .then((res) => res.text())
  .then((text) => {
    const config = eval(text); // Read the config file and display photos in album
    config.forEach((cardConfig) => {
      const card = new Card(cardConfig);
      const generateElement = card.generate();
      document
        .querySelector("div.container .album")
        .appendChild(generateElement);
    });
  })
  .catch((e) => console.error(e));

// Handle upload photo
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  fetch(form.action, {
    method: "post",
    body: new FormData(form),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    window.location.href = "/"; // Redirect to homepage
  });
});
