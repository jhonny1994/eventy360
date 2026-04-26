class LocationOption {
  const LocationOption({
    required this.id,
    required this.name,
    this.wilayaId,
  });

  final int id;
  final String name;
  final int? wilayaId;
}
