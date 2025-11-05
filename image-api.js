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
    this.likes = {};
    this.dislikes = {};
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  static get styles() {
    return [super.styles, css`
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: var(--ddd-min-height, 100vh);
        background-color: var(--ddd-background, #f4f4f8);
        font-family: var(--ddd-font, Arial, sans-serif);
        padding: var(--ddd-page-padding, 24px);
        box-sizing: border-box;
        color: var(--ddd-text, #222);
      }

      .card {
        width: var(--ddd-card-width, 350px);
        background: var(--ddd-card-bg, #fff);
        border-radius: var(--ddd-radius, 16px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: var(--ddd-shadow, 0 2px 8px rgba(0,0,0,0.08));
      }

      .image-holder {
        width: 100%;
        height: 300px;
        background: #ddd;
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
        font-size: 1rem;
        color: #555;
      }

      .author-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
      }

      .username {
        font-weight: 700;
        font-size: 1.05rem;
      }

      .interact-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        border-top: 1px solid #eee;
        flex-wrap: wrap;
        gap: 10px;
      }

      .left-actions,
      .right-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      button {
        cursor: pointer;
        border: none;
        border-radius: 6px;
        background: #3b82f6;
        color: #fff;
        font-size: 1rem;
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 140ms ease, transform 140ms ease;
      }

      button:hover {
        background: #2563eb;
        transform: translateY(-2px);
      }

      .share-btn {
        width: auto;
        height: auto;
        padding: 6px 10px;
        font-size: 0.85rem;
        background: #1d4ed8;
      }

      .arrow {
        font-size: 1.2rem;
        border-radius: 50%;
      }

      .arrow[disabled] {
        opacity: 0.4;
        cursor: default;
      }

      .count {
        font-size: 0.95rem;
        color: #333;
        min-width: 26px;
        text-align: center;
      }

      /* 🌙 Dark Mode */
      @media (prefers-color-scheme: dark) {
        :host {
          background-color: #121212;
          color: #f5f5f5;
        }
        .card {
          background: #1e1e1e;
          box-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }
        .image-holder {
          background: #2a2a2a;
        }
        .placeholder {
          color: #aaa;
        }
        .interact-box {
          border-top: 1px solid #333;
        }
        button {
          background: #2563eb;
        }
        button:hover {
          background: #1e40af;
        }
        .share-btn {
          background: #1d4ed8;
        }
        .count {
          color: #ddd;
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
      <div class="card">
        <div class="author-info">
          <span class="username">Fox ${id}</span>
          <button class="share-btn" @click="${() => this.copyShareLink(id)}">Share</button>
        </div>

        <div class="image-holder"
          @touchstart="${this.handleTouchStart}"
          @touchend="${this.handleTouchEnd}">
          ${card.imageUrl
            ? html`<img src="${card.imageUrl}" alt="Fox ${id}" />`
            : html`<div class="placeholder">Loading fox...</div>`}
        </div>


        <div class="interact-box">
          <div class="left-actions">
            <button @click="${() => this.handleLike(id)}" aria-label="like">♡</button>
            <span class="count">${likes}</span>
            <button @click="${() => this.handleDislike(id)}" aria-label="dislike">>:(</button>
            <span class="count">${dislikes}</span>
          </div>

          <div class="right-actions">
            <button class="arrow" @click="${this.prev}" ?disabled="${this.currentIndex === 0}">⟨</button>
            <button class="arrow" @click="${this.next}" ?disabled="${this.currentIndex === this.cards.length - 1}">⟩</button>
          </div>
        </div>
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

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  }
  
  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }
  
  handleSwipeGesture() {
    const diff = this.touchEndX - this.touchStartX;
    const threshold = 50;
  
    if (Math.abs(diff) > threshold) {
      if (diff < 0) {
        this.next(); // Swipe left
      } else {
        this.prev(); // Swipe right
      }
    }
  }
  

  async copyShareLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?fox=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }
}

customElements.define(ImageApi.tag, ImageApi);
