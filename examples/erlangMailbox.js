(function() {
  var ErlangMailbox, anode, beh;
  anode = require('../lib/anode');
  beh = anode.beh;
  ErlangMailbox = exports;
  ErlangMailbox.mailbox_beh = beh(function() {
    var next;
    next = this.create(ErlangMailbox.end_mailbox_beh(this));
    this.become(ErlangMailbox.root_mailbox_beh(next));
    return this.raw(this._).to(this);
  });
  ErlangMailbox.end_mailbox_beh = beh('root', {
    'cust, #recv, pred': function() {
      var next;
      next = this.create(ErlangMailbox.end_mailbox_beh(this.root));
      return this.become(ErlangMailbox.recv_mailbox_beh(this.root, this.cust, this.pred, next));
    },
    'cust, #send, m': function() {
      var next;
      next = this.create(ErlangMailbox.end_mailbox_beh(this.root));
      this.become(ErlangMailbox.send_mailbox_beh(this.root, this.m, next));
      return this.send(this.root).to(this.cust);
    }
  });
  ErlangMailbox.recv_mailbox_beh = beh('root', 'cust', 'pred', 'next', {
    'cust2, #send, m': function() {
      if (this.pred(this.m)) {
        this.send(this.m).to(this.cust);
        this.become(ErlangMailbox.skip_mailbox_beh(this.next));
        this.send(this, '#prune', this.next).to(this.root);
        return this.send(this.root).to(this.cust2);
      } else {
        return this.raw(this._).to(this.next);
      }
    },
    '$next, #prune, next2': function() {
      return this.become(ErlangMailbox.recv_mailbox_beh(this.root, this.cust, this.pred, this.next2));
    },
    '_': function() {
      return this.raw(this._).to(this.next);
    }
  });
  ErlangMailbox.root_mailbox_beh = beh('next', {
    '$next, #prune, next2': function() {
      return this.become(ErlangMailbox.root_mailbox_beh(this.next2));
    },
    '_': function() {
      return this.raw(this._).to(this.next);
    }
  });
  ErlangMailbox.send_mailbox_beh = beh('root', 'm', 'next', {
    'cust, #recv, pred': function() {
      if (this.pred(this.m)) {
        this.send(this.m).to(this.cust);
        this.become(ErlangMailbox.skip_mailbox_beh(this.next));
        return this.send(this, '#prune', this.next).to(this.root);
      } else {
        return this.raw(this._).to(this.next);
      }
    },
    '$next, #prune, next2': function() {
      return this.become(ErlangMailbox.send_mailbox_beh(this.root, this.m, this.next2));
    },
    '_': function() {
      return this.raw(this._).to(this.next);
    }
  });
  ErlangMailbox.skip_mailbox_beh = beh('next', {
    '$next, #prune, next2': function() {
      return this.become(ErlangMailbox.skip_mailbox_beh(this.next2));
    },
    '_': function() {
      return this.raw(this._).to(this.next);
    }
  });
}).call(this);
