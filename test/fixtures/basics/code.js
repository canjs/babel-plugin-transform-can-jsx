const render = function({ count, handler }) {
    return <div on:click={handler}>{count}</div>;
};

const render2 = function(vm) {
    return <div on:click={vm.handler}>{vm.count}</div>;
};
