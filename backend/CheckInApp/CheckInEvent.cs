namespace CheckInApp.Controllers;

public class CheckInEvent
{
    public DateTimeOffset? TimeIn { get; set; }
    public DateTimeOffset? TimeOut { get; set; }
    public bool IsForcedCheckout { get; set; }
}