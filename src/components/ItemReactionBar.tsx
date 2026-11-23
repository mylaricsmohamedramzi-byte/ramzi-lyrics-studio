import { Button } from '@/components/ui/button';
import { REACTION_OPTIONS, type ItemReactionSummary } from '@/hooks/useItemReactions';

type ItemReactionBarProps = {
  itemId: string | number;
  reactions: ItemReactionSummary[];
  toggleReaction: (itemId: string | number, reaction: string) => Promise<void>;
  lang: string;
};

export default function ItemReactionBar({ itemId, reactions, toggleReaction, lang }: ItemReactionBarProps) {
  return (
    <div className="emoji-row" aria-label={lang === 'ar' ? 'التفاعلات' : 'Reactions'}>
      {REACTION_OPTIONS.map((emoji) => {
        const reaction = reactions.find((row) => row.reaction_type === emoji);
        const count = reaction?.reaction_count ?? 0;
        const selected = reaction?.user_reacted ?? false;
        return (
          <Button
            key={emoji}
            type="button"
            variant="ghost"
            size="sm"
            className={`emoji-btn ${selected ? 'active' : ''}`}
            aria-label={`${emoji} ${count}`}
            aria-pressed={selected}
            title={`${emoji} · ${count}`}
            onClick={(event) => {
              event.stopPropagation();
              void toggleReaction(itemId, emoji);
            }}
          >
            {emoji}<span aria-hidden="true">{count}</span>
          </Button>
        );
      })}
    </div>
  );
}