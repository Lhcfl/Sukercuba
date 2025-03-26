import type { EmojiSimple, Note } from "misskey-js/entities.js";
import { defineStore } from "pinia";
import type { Ref } from "vue";
import { useAccount } from "./account";
import { isPureRenote } from "misskey-js/note.js";
import { useUserCache } from "./user-cache";

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

/**
 * Use singleton mode to ensure that each note will be retrieved only once for the same period of time.
 */
export const useNoteCache = defineStore("note-cache", () => {
  const userCache = useUserCache();
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

					cached(replyNote);
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
				
        deleteNote(note.value.id, note.value.userId == me?.id && isPureRenote(note.value));
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
          deleteNote(note.value.id, note.value.userId == me?.id && isPureRenote(note.value));
				}
				break;
			}

      // fix sharkey
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			case 'updated' as any: {
				try {
          console.log({type, id, body});

					const editedNote = await account.api.request('notes/show', {
						noteId: id,
					});

					cached(editedNote, true);
				} catch { /* empty */ }
				break;
			}
    }
  })

  function deleteNote(noteId: Note["id"], isMe?: boolean) {
    const note = noteCache.get(noteId);
    if (note == null) return;
    if (note.value.isDeleted) return;
    note.value.isDeleted = true;
    if (note.value.renote) {
      note.value.renote.renoteCount--;
      if (isMe) {
        note.value.renote.renotedByMe = false;
      }
    }
  }

  function update(
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

    if (note.reply) update(note.reply)
    if (note.renote) update(note.renote)
  }

  function cached(note: Note, fully = false): Ref<NoteWithExtension> {
    const oldNote = noteCache.get(note.id);

    if (fully) {
      /**
       * we can also cache the user for the note
       */
      userCache.cache(note.user);
    }

    if (oldNote == null) {
      const storedNote = ref(note) as ActullyStoredNote;
      const reply = note.reply;
      if (reply) {
        storedNote.value.reply = cached(reply) as never;
      }
      const renote = note.renote;
      if (renote) {
        const storedRenote = cached(renote);
        storedNote.value.renote = storedRenote as never;
        if (fully) {
          storedRenote.value.renoteCount++;
          if (storedNote.value.userId == account.me?.id) {
            storedRenote.value.renotedByMe = true;
          }
        }
      }
      
      // subscribe the note
      account.streamApi.send("sr", { id: storedNote.value.id });

      noteCache.set(note.id, storedNote);
      return storedNote;
    } else {
      update(note, fully);
      return oldNote;
    }
  }

  return {
    noteCache,
    cached,
    update,
  };
});
