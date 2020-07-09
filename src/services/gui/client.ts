import * as moment from 'moment';

import { sep } from 'path';
import { format } from 'util';
import { JSONObject } from 'puppeteer-core';

import { ApiClient } from '../api/client';
import { ChromiumLauncher } from '../chromium/launcher';
import { ResourceResolver } from '../resource/resolver';
import { Assignment, compare } from '../../models/assignment';
import { Class } from '../../models/class';
import { encode } from '../../utils/url';

const transform = (assignment: Assignment) => {
  const dueDateTime = moment(assignment.dueDateTime);
  const nowDateTime = moment();

  return {
    ...assignment,
    dueDateTime: dueDateTime.format('ll LTS'),
    isOverdue: !assignment.isCompleted && dueDateTime.isBefore(nowDateTime),
  };
};

export class GuiClient {
  constructor(
    private apiClient: ApiClient,
    private chromiumLauncher: ChromiumLauncher,
    private resourceResolver: ResourceResolver
  ) {}

  async start(): Promise<void> {
    const assetsDirectory = await this.resourceResolver.resolve('assets');
    const page = await this.chromiumLauncher.launch(
      format(
        'file:///%s',
        [...assetsDirectory.split(sep).map(encode), 'index.html'].join('/')
      )
    );

    for (const c of await this.apiClient.getClasses()) {
      const assignments = (await this.apiClient.getAssignments(c.id))
        .sort(compare)
        .map(transform);

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
