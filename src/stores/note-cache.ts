import type { EmojiSimple, Note } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import type { Ref } from "vue";
import { useAccount } from "./account";

export type NoteWithExtension = Note & {
  renote?: NoteWithExtension,
  reply?: NoteWithExtension,
  renotedByMe?: boolean;
  isDeleted?: boolean;
}

type ActullyStoredNote = Ref<Exclude<NoteWithExtension, 'renote' | 'reply'> & {
  renote?: Ref<NoteWithExtension>,
  reply?: Ref<NoteWithExtension>,
}>;

export const useNoteCache = defineStore("note-cache", () => {
  const noteCache = new Map<Note["id"], ActullyStoredNote>();

  const account = useAccount();

  account.streamApi.on('noteUpdated', async ({ type, id, body}) => {
    const note = noteCache.get(id);
    const me = account.me;

    switch(type) {
      // fix sharkey
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'replied' as any: {
				try {
          // notes/show may throw if the current user can't see the note
					const replyNote = await account.api.request('notes/show', {
						noteId: (body as unknown as { id: string }).id,
					});

					stored(replyNote);
				} catch { /* empty */ }
				break;
			}

      case "reacted": {
        if (note == null) { return; }

        const emoji = body.emoji as string | EmojiSimple | null

        if (typeof emoji === 'object' && emoji != null && 'url' in emoji) {
          note.value.reactionEmojis[emoji.name] = emoji.url;
        }

        note.value.reactions[body.reaction] ??= 0;
        note.value.reactions[body.reaction] ++;

        if (body.userId === me?.id) {
          note.value.myReaction = body.reaction;
        }
        break;
      }
      case "unreacted": {
        if (note == null) { return; }
        note.value.reactions[body.reaction] ??= 1;
        note.value.reactions[body.reaction] --;
        if (note.value.reactions[body.reaction] == 0) {
          delete note.value.reactions[body.reaction];
        }

        if (body.userId === me?.id) {
          note.value.myReaction = null;
        }
        break;
      }

      case 'pollVoted': {
        if (note == null) { return; }

        // sharkey have poll
				const choice = (body as unknown as { choice: number }).choice;
        if (choice == null) return;

				const choices = [...note.value.poll!.choices];
				choices[choice] = {
					...choices[choice],
					votes: choices[choice].votes + 1,
					...(me && (body.userId === me.id) ? {
						isVoted: true,
					} : {}),
				};

				note.value.poll!.choices = choices;
				break;
			}

			case 'deleted': {
        if (note == null) { return; }
				
        note.value.isDeleted = true;
				break;
			}

      // fix sharkey stelpolva
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
			case 'madePrivate' as any: {
        if (note == null) { return; }
				
        if (me?.id === note.value.userId) {
					note.value.visibility = 'specified';
				} else {
					// perform delete
					note.value.isDeleted = true;
				}
				break;
			}

      // fix sharkey
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			case 'updated' as any: {
				try {
					const editedNote = await account.api.request('notes/show', {
						noteId: id,
					});

					stored(editedNote, true);
				} catch { /* empty */ }
				break;
			}
    }
  })

  function updateNote(
    note: Partial<Note> & { id: Note["id"] },
    fully = false
  ) {
    const oldNote = noteCache.get(note.id);

    if (!oldNote) { return; }

    const updateKeys = new Set([
      ...Object.keys(note),
      ...(fully ? Object.keys(oldNote.value) : []),
    ]);

    updateKeys.delete("reply");
    updateKeys.delete("renote");
    updateKeys.delete("id");

    for (const key of [...updateKeys]) {
      (oldNote.value as Record<string, unknown>)[key] = (note as Record<string, unknown>)[key];
    }

    if (note.reply) updateNote(note.reply)
    if (note.renote) updateNote(note.renote)
  }

  function stored(note: Note, fully = false): Ref<NoteWithExtension> {
    const oldNote = noteCache.get(note.id);

    if (oldNote == null) {
      const storedNote = ref(note) as ActullyStoredNote;
      const reply = note.reply;
      if (reply) {
        storedNote.value.reply = stored(reply) as never;
      }
      const renote = note.renote;
      if (renote) {
        storedNote.value.renote = stored(renote) as never;
      }
      
      // subscribe the note
      account.streamApi.send("sr", { id: storedNote.value.id });

      noteCache.set(note.id, storedNote);
      console.log("stored note: ", storedNote.value);
      return storedNote;
    } else {
      console.log("stored(updated) note: ", oldNote.value);
      updateNote(note, fully);
      return oldNote;
    }
  }

  function update(data: Partial<NoteWithExtension> & { id: Note["id"] }) {
    console.log(noteCache.get(data.id));
    watch(noteCache.get(data.id)!, (nv, ov) => {
      console.log([ov, "->", nv]);   
    }, { once: true });
    console.log("updating note: ", data);
    updateNote(data);
  }

  return {
    noteCache,
    stored,
    update,
  };
});
