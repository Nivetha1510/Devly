import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COURSES } from '../src/data/courses';
import { cardAwardKey, cardsFor, deckCounts, filterCards, nextCardState, statusOf } from '../src/data/flashcards';

const py = COURSES.find((c) => c.id === 'py')!;

test('every course gets two cards per lesson with unique ids and a topic', () => {
  for (const course of COURSES) {
    const cards = cardsFor(course);
    assert.equal(cards.length, course.lessons * 2, course.id);
    assert.equal(new Set(cards.map((c) => c.id)).size, cards.length);
    const topics = new Set(course.modules.map((m) => m.title));
    for (const c of cards) {
      assert.ok(topics.has(c.topic));
      assert.ok(c.theory.length > 20);
      assert.ok(c.seconds >= 10);
    }
  }
});

test('concept cards carry the lesson code example', () => {
  const cards = cardsFor(py);
  assert.ok(cards[0].code && cards[0].code.text.includes('print'));
  assert.equal(cards[1].kind, 'practice');
});

test('status moves forward and review sends a card back to in progress', () => {
  let cards: Record<string, 'seen' | 'done'> = {};
  assert.equal(statusOf(cards, 'x'), 'not_started');
  cards = nextCardState(cards, 'x', 'seen');
  assert.equal(statusOf(cards, 'x'), 'in_progress');
  cards = nextCardState(cards, 'x', 'done');
  assert.equal(statusOf(cards, 'x'), 'completed');
  // Viewing again must not undo completion.
  assert.equal(nextCardState(cards, 'x', 'seen'), cards);
  cards = nextCardState(cards, 'x', 'review');
  assert.equal(statusOf(cards, 'x'), 'in_progress');
  assert.equal(cardAwardKey('py:1:a'), 'card:py:1:a');
});

test('filters by topic, status and search; counts by status', () => {
  const all = cardsFor(py);
  const first = all[0].id;
  const state: Record<string, 'seen' | 'done'> = { [first]: 'done', [all[1].id]: 'seen' };
  const topic = py.modules[0].title;
  assert.ok(filterCards(all, { topic, status: 'all', query: '' }, state).every((c) => c.topic === topic));
  assert.deepEqual(filterCards(all, { topic: null, status: 'completed', query: '' }, state).map((c) => c.id), [first]);
  assert.equal(filterCards(all, { topic: null, status: 'in_progress', query: '' }, state).length, 1);
  assert.ok(filterCards(all, { topic: null, status: 'all', query: 'LOOP' }, state).length > 0);
  assert.equal(filterCards(all, { topic: null, status: 'all', query: 'zzzzqq' }, state).length, 0);
  assert.deepEqual(deckCounts(all, state), { total: all.length, completed: 1, inProgress: 1 });
});
