const render = makeObservable(function ({ count, handler }) {
    return canJsx.h(
        "div",
        { onClick: handler },
        count
    );
});

const render2 = function (vm) {
    return canJsx.h(
        "div",
        { onClick: vm.handler },
        vm.count
    );
};
