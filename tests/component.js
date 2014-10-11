var chai = require('chai');
var jsdom = require('jsdom');
var React  = require("react/addons"),
    ReactTestUtils = React.addons.TestUtils;

chai.should();

var component = require('../');


describe('component', function () {

  describe('mixins', function () {
    beforeEach(function() {
      global.document = jsdom.jsdom('<html><body></body></html>');
      global.window = global.document.parentWindow;
    });

    afterEach(function() {
      delete global.document;
      delete global.window;
    });

    it('should be able to take mixins', function (done) {
      var Component = component([{
        myMixin: noop
      }], function () {
        this.should.have.property('myMixin');
        this.should.not.have.property('bogusMixin');

        done();
        return React.DOM.text(null, 'hello');
      });

      ReactTestUtils.renderIntoDocument(Component());
    });

  });
});


function noop () {}
