namespace CheckInApp.Controllers;

public class UserInfo
{
    public string Email { get; set; }
    public CheckInEvent? LastCheckIn { get; set; }
}