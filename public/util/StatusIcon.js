
class StatusIcon {
  constructor(selector) {
    this.toggle = DomHelper.iconToggle(selector, ['success', 'error']);
  }

  wait() { this.toggle('hourglass_empty'); }
  success() { this.toggle('check_circle', 'success'); }
  error() { this.toggle('error', 'error'); }
  clear() { this.toggle(''); }
}