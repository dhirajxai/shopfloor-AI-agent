import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads the allocation board and renders KPIs', async ({ page }) => {
  await expect(page.locator('[data-testid="allocation-board"]')).toBeVisible();
  await expect(page.locator('[data-testid="kpi-util"]')).toHaveText(/\d+%/);
  await expect(page.locator('[data-testid="kpi-labor"]')).toHaveText(/\d+%/);
  await expect(page.locator('[data-testid="kpi-throughput"]')).toHaveText(/\d+/);
});

test('filters work orders by text search', async ({ page }) => {
  await page.fill('[data-testid="filter-text"]', 'Frame');
  await expect(page.locator('[data-testid^="workorder-card-"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="workorder-card-WO-1002"]')).toBeVisible();
});

test('moves a work order between machine lanes', async ({ page }) => {
  const card = page.locator('[data-testid="workorder-card-WO-1001"]');
  const targetCards = page.locator('[data-testid="machine-cards-m-2"]');
  await expect(card).toBeVisible();
  await card.dragTo(targetCards);
  await expect(page.locator('[data-testid="machine-cards-m-2"] [data-testid="workorder-card-WO-1001"]')).toBeVisible();
  await expect(page.locator('[data-testid="audit-log"]')).toContainText('Moved WO-1001');
});

test('opens work order modal and updates assignment', async ({ page }) => {
  const card = page.locator('[data-testid="workorder-card-WO-1002"]');
  await card.dblclick();
  await expect(page.locator('[data-testid="workorder-modal"]')).toBeVisible();

  await page.selectOption('#selOp', 'op-3');
  await page.selectOption('#selPri', 'High');
  await page.click('[data-testid="modal-save"]');

  await expect(page.locator('[data-testid="workorder-modal"]')).toBeHidden();
  await expect(page.locator('[data-testid="audit-log"]').locator('li', { hasText: 'Updated WO-1002' })).toBeVisible();
});
