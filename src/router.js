import Vue from 'vue';
import Router from 'vue-router';
import Demo from './demo';

Vue.use(Router);

const routes = [{
  path: '/ges-lock',
  component: Demo,
  meta: {
    title: '手势密码',
  },
}];


export default new Router({ routes });
