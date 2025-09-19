import * as IDB from "idb-keyval";
import type { DriveFile } from "misskey-js/entities.js";
import type { NoteWithExtension } from "./note-cache";

export type DraftPoll = {
  choices: string[];
  multiple?: boolean;
  expiresAt?: number | null;
  expiredAfter?: number | null;
};

type DraftOpts = {
  id?: string;
  replyId?: string;
  quoteId?: string;
  edit?: NoteWithExtension;
};

export type DraftState = {
  text: string;
  cw: string;
  appendTags: string[];
  visibility: NoteWithExtension["visibility"];
  localOnly: boolean;
  poll: DraftPoll;
  files: DriveFile[];
  showCw: boolean;
  showTags: boolean;
  showPreview: boolean;
  showPoll: boolean;
};

export class IdbDraft {
  constructor(private opts: DraftOpts) {}

  // when null, it means not loaded yet
  // and it will not be exposed outside
  private state = ref<DraftState>(null as never);

  get storeId() {
    let storeId = "draft:";
    if (this.opts.edit) {
      storeId += `edit:${this.opts.edit.id}:`;
    } else if (this.opts.replyId) {
      storeId += `reply:${this.opts.replyId}:`;
    } else if (this.opts.quoteId) {
      storeId += `quote:${this.opts.quoteId}:`;
    } else {
      storeId += `create::`;
    }

    if (this.opts.id) {
      storeId += `${this.opts.id}`;
    } else {
      storeId += `default`;
    }
    return storeId;
  }

  defaultDraft(): DraftState {
    return {
      text: this.opts.edit?.text || "",
      cw: this.opts.edit?.cw || "",
      appendTags: [],
      visibility: "public",
      localOnly: false,
      poll: {
        choices: [],
        multiple: false,
        expiresAt: null,
        expiredAfter: null,
      },
      files: [],
      showCw: !!this.opts.edit?.cw,
      showTags: false,
      showPreview: false,
      showPoll: false,
    };
  }

  async load() {
    const memory = await IDB.get(this.storeId);
    if (!memory) {
      this.state.value = this.defaultDraft();
    } else {
      // to merge new fields
      this.state.value = { ...this.defaultDraft(), ...memory };
    }
    return this.state;
  }

  async save() {
    const toSave = toRaw(this.state.value);
    await IDB.set(this.storeId, toSave);
  }

  async remove() {
    await IDB.del(this.storeId);
    this.state.value = this.defaultDraft();
  }

  async clean() {
    // Clean draft
    this.state.value.text = "";
    this.state.value.poll = { choices: [] };
    this.state.value.files = [];
  }
}
