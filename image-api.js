/**
 * Copyright 2025 dcagliola
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `image-api`
 * Fetches random fox images and displays them in a card with like/dislike.
 */
export class ImageApi extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "image-api";
  }

  static get properties() {
    return {
      ...super.properties,
      imageUrl: { type: String },
      likes: { type: Number },
      dislikes: { type: Number },
    };
  }

  constructor() {
    super();
    this.imageUrl = "";
    this.likes = 0;
    this.dislikes = 0;
  }

  static get styles() {
    return [super.styles, css`
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--ddd-theme-accent, #f9f9f9);
        font-family: var(--ddd-font-navigation, Arial, sans-serif);
      }

      .card {
        background: #eeafaf;
        border-radius: 16px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        padding: 20px;
        width: 340px;
        text-align: center;
      }

      img {
        width: 100%;
        height: auto;
        max-height: 300px;
        border-radius: 12px;
        object-fit: cover;
        margin-bottom: 16px;
      }

      .placeholder {
        color: #888;
        font-style: italic;
        margin: 20px 0;
      }

      .actions {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .like-btn,
      .dislike-btn {
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        font-size: 1.4rem;
        cursor: pointer;
      }

      .like-btn,
      .dislike-btn {
        background-color: #ff8800;
      }

      .like-btn:hover,
      .dislike-btn:hover {
        background-color: #e06d00;
      }

      .count {
        font-size: 1rem;
        font-weight: bold;
        color: #333;
      }

      .next-btn {
        background-color: #ff6600;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: bold;
      }

      .next-btn:hover {
        background-color: #e05500;
      }
    `];
  }

  render() {
    return html`
      <div class="card">
        <h3 class="outlined-text">Not a Kangaroo</h3>

        ${this.imageUrl
          ? html`<img src="${this.imageUrl}" alt="Random fox image" />`
          : html`<div class="placeholder">Click below to begin!</div>`}

        <div class="actions">
          <button class="like-btn" @click="${this.like}">❤️</button>
          <span class="count">${this.likes}</span>
          <button class="dislike-btn" @click="${this.dislike}">💔</button>
          <span class="count">${this.dislikes}</span>
        </div>

        <button class="next-btn" @click="${this.getFoxes}">Next Creature</button>
      </div>
    `;
  }

  // Fetch a new fox image
  getFoxes() {
    fetch("https://randomfox.ca/floof/")
      .then((resp) => resp.ok ? resp.json() : Promise.reject(resp))
      .then((data) => {
        this.imageUrl = data.image;
      })
      .catch((err) => console.error("Error fetching fox:", err));
  }

  // Like/dislike counters
  like() {
    this.likes++;
  }

  dislike() {
    this.dislikes++;
  }

  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url).href;
  }
}

globalThis.customElements.define(ImageApi.tag, ImageApi);
