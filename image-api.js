import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `image-api`
 * Instagram-like slider with persistent likes/dislikes and share links.
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
      likes: { type: Object },
      dislikes: { type: Object },
    };
  }

  constructor() {
    super();
    this.cards = Array.from({ length: 51 }, (_, i) => ({
      id: i + 1,
      imageUrl: "",
      likes: 0,
      dislikes: 0,
      loaded: false,
    }));
    this.currentIndex = 0;
    this.copied = false;
    this.likes = {};
    this.dislikes = {};
  }

  static get styles() {
    return [super.styles, css`
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: var(--ddd-min-height, 100vh);
        background-color: var(--ddd-background, var(--ddd-theme-accent, #f4f4f8));
        font-family: var(--ddd-font, var(--ddd-font-navigation, Arial, sans-serif));
        padding: var(--ddd-page-padding, 24px);
        box-sizing: border-box;
        color: var(--ddd-text, #222);
      }
      .container {
        display: flex;
        align-items: center;
        gap: var(--ddd-gap, 16px);
      }
      .card {
        width: var(--ddd-card-width, 350px);
        background: var(--ddd-card-bg, #fff);
        border-radius: var(--ddd-radius, 16px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: var(--ddd-shadow, 0 2px 8px rgba(0,0,0,0.08));
        transition: transform 160ms var(--ddd-easing, ease), box-shadow 160ms var(--ddd-easing, ease);
      }
      .card:hover {
        transform: translateY(-4px);
        box-shadow: var(--ddd-shadow-hover, 0 8px 24px rgba(0,0,0,0.12));
      }
      .image-holder {
        width: 100%;
        height: var(--ddd-image-height, 300px);
        background: var(--ddd-placeholder-bg, #ddd);
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      .image-holder img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .placeholder {
        font-size: var(--ddd-placeholder-font-size, 1rem);
        color: var(--ddd-muted, #555);
      }
      .author-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--ddd-surface-padding, 16px);
      }
      .username {
        font-weight: var(--ddd-username-weight, 700);
        font-size: var(--ddd-username-size, 1.05rem);
      }
      .interact-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--ddd-surface-padding, 14px 16px);
        border-top: 1px solid var(--ddd-border, #eee);
      }
      .left-actions,
      .right-actions {
        display: flex;
        align-items: center;
        gap: var(--ddd-gap-small, 10px);
      }
      button {
        cursor: pointer;
        border: none;
        border-radius: var(--ddd-btn-radius, 6px);
        background: var(--ddd-btn-bg, #3b82f6); /* base blue */
        color: var(--ddd-btn-fore, #fff);
        font-size: var(--ddd-btn-font-size, 1rem);
        width: var(--ddd-btn-size, 44px);
        height: var(--ddd-btn-size, 44px);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 140ms var(--ddd-easing, ease), transform 140ms var(--ddd-easing, ease);
      }
      button:hover {
        background: var(--ddd-btn-bg-hover, #2563eb); /* darker blue hover */
        transform: translateY(-2px);
      }

      .share-btn {
        width: auto;
        height: auto;
        padding: var(--ddd-share-padding, 6px 10px);
        font-size: var(--ddd-share-font-size, 0.85rem);
        background: var(--ddd-share-bg, #1d4ed8); /* deep blue */
        color: var(--ddd-share-fore, #fff);
      }

      .arrow {
        width: var(--ddd-arrow-size, 34px);
        height: var(--ddd-arrow-size, 34px);
        font-size: var(--ddd-arrow-font-size, 1.2rem);
        background: var(--ddd-accent, #3b82f6); /* same nice blue */
        color: #fff;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 140ms var(--ddd-easing, ease);
      }
      .arrow:hover {
        background: #2563eb;
      }
      .arrow[disabled] {
        opacity: 0.4;
        cursor: default;
      }
      .copied-msg {
        text-align: center;
        font-size: var(--ddd-copied-font-size, 0.8rem);
        color: var(--ddd-success, green);
      }
      .count {
        font-size: var(--ddd-count-size, 0.95rem);
        color: var(--ddd-text-muted, #333);
        min-width: 26px;
        text-align: center;
      }
      
      @media (prefers-color-scheme: dark) {
      :host {
        background-color: var(--ddd-background-dark, #121212);
        color: var(--ddd-text-dark, #f5f5f5);
      }
      .card {
        background: var(--ddd-card-bg-dark, #1e1e1e);
        box-shadow: var(--ddd-shadow-dark, 0 2px 12px rgba(0,0,0,0.6));
      }
      .image-holder {
        background: var(--ddd-placeholder-bg-dark, #2a2a2a);
      }
      .placeholder {
        color: var(--ddd-muted-dark, #aaa);
      }
      .interact-box {
        border-top: 1px solid var(--ddd-border-dark, #333);
      }
      button {
        background: var(--ddd-btn-bg-dark, #2563eb);
        color: var(--ddd-btn-fore-dark, #fff);
      }
      button:hover {
        background: var(--ddd-btn-bg-hover-dark, #1e40af);
      }
      .share-btn {
        background: var(--ddd-share-bg-dark, #1d4ed8);
      }
      .arrow {
        background: var(--ddd-accent-dark, #3b82f6);
      }
      .arrow:hover {
        background: var(--ddd-accent-hover-dark, #1d4ed8);
      }
      .count {
        color: var(--ddd-text-muted-dark, #ddd);
      }
    }
    `];
  }

  render() {
    const card = this.cards[this.currentIndex];
    const id = card.id;
    const likes = this.likes[id] || 0;
    const dislikes = this.dislikes[id] || 0;

    return html`
      <div class="container">
        <button class="arrow" @click="${this.prev}" ?disabled="${this.currentIndex === 0}">⟨</button>

        <div class="card">
          <div class="author-info">
            <span class="username">Fox ${id}</span>
            <button class="share-btn" @click="${() => this.copyShareLink(id)}">Share</button>
          </div>

          <div class="image-holder">
            ${card.imageUrl
              ? html`<img src="${card.imageUrl}" alt="Fox ${id}" />`
              : html`<div class="placeholder">Loading fox...</div>`}
          </div>

          <div class="interact-box">
            <div class="left-actions">
              <button class="like-btn" @click="${() => this.handleLike(id)}" aria-label="like">♡</button>
              <span class="count">${likes}</span>
              <button class="dislike-btn" @click="${() => this.handleDislike(id)}" aria-label="dislike">>:(</button>
              <span class="count">${dislikes}</span>
            </div>

            <div class="right-actions">
              ${this.copied ? html`<div class="copied-msg">Link copied!</div>` : ""}
            </div>
          </div>
        </div>

        <button class="arrow" @click="${this.next}" ?disabled="${this.currentIndex === this.cards.length - 1}">⟩</button>
      </div>
    `;
  }

  firstUpdated() {
    this.loadFromStorage();

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

  loadImage(index) {
    const card = this.cards[index];
    if (!card || card.loaded) return;
    const imageUrl = `https://randomfox.ca/images/${card.id}.jpg`;
    const updated = [...this.cards];
    updated[index] = { ...card, imageUrl, loaded: true };
    this.cards = updated;
  }

  loadFromStorage() {
    const savedLikes = localStorage.getItem("foxGalleryLikes");
    const savedDislikes = localStorage.getItem("foxGalleryDislikes");
    if (savedLikes) this.likes = JSON.parse(savedLikes);
    if (savedDislikes) this.dislikes = JSON.parse(savedDislikes);
  }

  saveToStorage() {
    localStorage.setItem("foxGalleryLikes", JSON.stringify(this.likes));
    localStorage.setItem("foxGalleryDislikes", JSON.stringify(this.dislikes));
  }

  handleLike(id) {
    this.likes[id] = (this.likes[id] || 0) + 1;
    this.saveToStorage();
    this.requestUpdate();
  }

  handleDislike(id) {
    this.dislikes[id] = (this.dislikes[id] || 0) + 1;
    this.saveToStorage();
    this.requestUpdate();
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

customElements.define(ImageApi.tag, ImageApi);
