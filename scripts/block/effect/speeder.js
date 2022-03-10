const speeder = new OverdriveProjector("speeder");
Object.assign(speeder, {
    range : 4.85*8,
    speedBoost : 1.2,
    phaseRangeBoost : 20,
    speedBoostPhase : 0.25,
});
speeder.consumes.power(1.5);
speeder.consumes.item(Items.silicon).boost();
speeder.requirements = ItemStack.with(
    Items.lead, 40,
    Items.silicon, 30,
    Items.titanium, 30
);
speeder.buildVisibility = BuildVisibility.shown;
speeder.category = Category.effect;

exports.speeder = speeder;
