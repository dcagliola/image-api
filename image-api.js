/**
 * Copyright 2025 dcagliola
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `image-api`
 * Simple Instagram-like slider showing static fox images (1–51)
 * with share links that copy to clipboard and restore state.
 */
export class ImageApi extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "image-api";
  }

  static get properties() {
    return {
      ...super.properties,
      cards: { type: Array },
      currentIndex: { type: Number },
      copied: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.cards = Array.from({ length: 51 }, (_, i) => ({
      id: i + 1,
      imageUrl: "", // IntersectionObserver will load
      likes: 0,
      dislikes: 0,
      loaded: false, // updates on fetch
    }));
    this.currentIndex = 0;
    this.copied = false;
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

      .container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
      }

      .arrow {
        font-size: 2rem;
        border: none;
        background: none;
        cursor: pointer;
        color: #ff6600;
      }

      .arrow[disabled] {
        opacity: 0.4;
        cursor: default;
      }

      .card {
        width: 340px;
        background: #eeafaf;
        border-radius: 16px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        padding: 20px;
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

      .share {
        font-size: 0.9rem;
        color: #333;
        margin-top: 8px;
      }

      .share button {
        border: none;
        background: #ff6600;
        color: white;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 0.85rem;
      }

      .share button:hover {
        background: #e05600;
      }

      .copied-msg {
        color: green;
        font-size: 0.8rem;
        margin-top: 6px;
      }
    `];
  }

  render() {
    const card = this.cards[this.currentIndex];
    return html`
      <div class="container">
        <button class="arrow" @click="${this.prev}" ?disabled="${this.currentIndex === 0}">⟨</button>

        <div class="card">
          <h3>Fox ${card.id}</h3>

          ${card.imageUrl
            ? html`<img src="${card.imageUrl}" alt="Fox ${card.id}" />`
            : html`<div class="placeholder">Loading fox...</div>`}

          <div class="actions">
            <button class="like-btn" @click="${() => this.like(card.id)}">❤️</button>
            <span class="count">${card.likes}</span>
            <button class="dislike-btn" @click="${() => this.dislike(card.id)}">💔</button>
            <span class="count">${card.dislikes}</span>
          </div>

          <div class="share">
            <button @click="${() => this.copyShareLink(card.id)}">Copy Share Link</button>
            ${this.copied ? html`<div class="copied-msg">Link copied!</div>` : ""}
          </div>
        </div>

        <button class="arrow" @click="${this.next}" ?disabled="${this.currentIndex === this.cards.length - 1}">⟩</button>
      </div>
    `;
  }

  firstUpdated() {
    // Detect shared link (?fox=number)
    const params = new URLSearchParams(window.location.search);
    const foxNum = parseInt(params.get("fox"));
    if (foxNum && foxNum >= 1 && foxNum <= 51) {
      this.currentIndex = foxNum - 1;
    }
    this.loadImage(this.currentIndex);
  }

  updated(changedProps) {
    if (changedProps.has("currentIndex")) {
      this.loadImage(this.currentIndex);
    }
  }

  // Mozilla design, AI put it together for my code.
  loadImage(index) {
    const card = this.cards[index];
    if (!card || card.loaded) return;
    const imageUrl = `https://randomfox.ca/images/${card.id}.jpg`;
    const updated = [...this.cards];
    updated[index] = { ...card, imageUrl, loaded: true };
    this.cards = updated;
  }

  // AI helped me get the likes and dislikes to be per card
  // It initially was just a single like and dislike count for all cards
  like(id) {
    this.cards = this.cards.map(c =>
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    );
  }

  dislike(id) {
    this.cards = this.cards.map(c =>
      c.id === id ? { ...c, dislikes: c.dislikes + 1 } : c
    );
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Yea this was fully ChatGPT, I get what its doing but 
    // I was not coming to this conclusion on my own.
  async copyShareLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?fox=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }
}

globalThis.customElements.define(ImageApi.tag, ImageApi);
