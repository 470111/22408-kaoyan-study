import type { Achievement } from '../mountain/achievements';

interface Props {
  achievements: Achievement[];
}

export function AchievementList({ achievements }: Props) {
  return (
    <div className="achievement-list">
      <h3>里程碑</h3>
      <ul>
        {achievements.map((a) => (
          <li key={a.id} className={a.unlocked ? 'unlocked' : 'locked'}>
            <span className="achievement-icon">{a.unlocked ? '✓' : '○'}</span>
            <div>
              <strong>{a.name}</strong>
              <p>{a.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
