import * as moment from 'moment';

import { join } from 'path';
import { JSONObject } from 'puppeteer-core';

import { ApiClient } from '../api/client';
import { ChromiumLauncher } from '../chromium/launcher';
import { ResourceResolver } from '../resource/resolver';
import { Assignment } from '../../models/assignment';
import { Class } from '../../models/class';

export class GuiClient {
  constructor(
    private apiClient: ApiClient,
    private chromiumLauncher: ChromiumLauncher,
    private resourceResolver: ResourceResolver
  ) {}

  async start(): Promise<void> {
    const assetsDirectory = await this.resourceResolver.resolve('assets');
    const page = await this.chromiumLauncher.launch(
      join(assetsDirectory, 'index.html')
    );

    for (const c of await this.apiClient.getClasses()) {
      const assignments = (await this.apiClient.getAssignments(c.id))
        .sort((a: Assignment, b: Assignment) =>
          a.dueDateTime.localeCompare(b.dueDateTime)
        )
        .map((a) => {
          const dueDateTime = moment(a.dueDateTime);
          const nowDateTime = moment();

          return {
            ...a,
            dueDateTime: dueDateTime.format('ll LTS'),
            isOverdue: !a.isCompleted && dueDateTime.isBefore(nowDateTime),
          };
        });

      await page.evaluate(
        (c: Class, assignments: (Assignment & { isOverdue: boolean })[]) => {
          const $classes = document.getElementById('classes');
          const $class = document.createElement('li');
          const $name = document.createElement('span');
          const $assignments = document.createElement('ul');

          for (const a of assignments) {
            const $assignment = document.createElement('li');

            $assignment.textContent = a.displayName;
            $assignment.setAttribute('data-due-datetime', a.dueDateTime);
            $assignment.setAttribute('data-overdue', a.isOverdue ? '1' : '0');
            $assignment.setAttribute(
              'data-completed',
              a.isCompleted ? '1' : '0'
            );

            $assignments.appendChild($assignment);
          }

          $name.textContent = c.name;
          $name.addEventListener('click', () => {
            $class.classList.toggle('is-hidden');
          });

          $class.appendChild($name);
          $class.appendChild($assignments);
          $classes.appendChild($class);
        },
        (c as unknown) as JSONObject,
        (assignments as unknown) as JSONObject
      );
    }
  }
}
